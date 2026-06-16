import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api";
import { createAuthenticatedSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext";

function formatPrice(n) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CarDetail() {
  const { id } = useParams();
  const isValidId = /^[a-f0-9]{24}$/i.test(id || "");
  const { auth } = useAuth();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [reserve, setReserve] = useState({ message: "", preferredDate: "" });
  const [commande, setCommande] = useState({ message: "" });
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");

  const loadCar = useCallback(async () => {
    const { data } = await api.get(`/api/cars/${id}`);
    setCar(data);
  }, [id]);

  useEffect(() => {
    if (!isValidId) {
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        setError("");
        await loadCar();
        const [r, s] = await Promise.all([
          api.get(`/api/cars/${id}/reviews`),
          api.get(`/api/cars/${id}/reviews/summary`),
        ]);
        if (!cancelled) {
          setReviews(r.data);
          setSummary(s.data);
        }
      } catch {
        if (!cancelled) setError("Véhicule introuvable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, loadCar, isValidId]);

  useEffect(() => {
    if (!auth.accessToken || !id || !isValidId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/cars/${id}/messages`);
        if (!cancelled) setMessages(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.accessToken, id, isValidId]);

  useEffect(() => {
    if (!auth.accessToken || !id || !isValidId) return undefined;
    const socket = createAuthenticatedSocket(auth.accessToken);
    const onConnect = () => {
      socket.emit("join:car", id);
    };
    socket.on("connect", onConnect);
    if (socket.connected) onConnect();
    socket.on("chat:message", (msg) => {
      setMessages((prev) => {
        const sid = msg._id || msg.id;
        if (sid && prev.some((m) => String(m._id) === String(sid))) {
          return prev;
        }
        const next = [...prev, msg];
        return next.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });
    return () => {
      socket.emit("leave:car", id);
      socket.off("connect", onConnect);
      socket.off("chat:message");
      socket.disconnect();
    };
  }, [auth.accessToken, id, isValidId]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!msgText.trim()) return;
    const { data } = await api.post(`/api/cars/${id}/messages`, {
      text: msgText.trim(),
    });
    setMsgText("");
    setMessages((prev) => {
      if (prev.some((m) => String(m._id) === String(data._id))) return prev;
      return [...prev, data].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }

  async function submitContact(e) {
    e.preventDefault();
    await api.post("/api/contact", {
      car: id,
      ...contactForm,
    });
    setContactOpen(false);
    setContactForm({ name: "", email: "", phone: "", message: "" });
    alert("Message envoyé. Le vendeur peut vous répondre par email ou WhatsApp.");
  }

  async function submitReserve(e) {
    e.preventDefault();
    await api.post("/api/reservations", {
      car: id,
      kind: "reservation",
      message: reserve.message,
      preferredDate: reserve.preferredDate || undefined,
    });
    setReserve({ message: "", preferredDate: "" });
    alert("Demande de réservation enregistrée. L’admin la confirmera.");
  }

  async function submitCommande(e) {
    e.preventDefault();
    await api.post("/api/reservations", {
      car: id,
      kind: "commande",
      message: commande.message || "Passer commande pour ce véhicule.",
    });
    setCommande({ message: "" });
    alert("Votre commande a été transmise à l’administrateur pour confirmation.");
  }

  async function submitReview(e) {
    e.preventDefault();
    await api.post(`/api/cars/${id}/reviews`, review);
    const { data } = await api.get(`/api/cars/${id}/reviews`);
    setReviews(data);
    const { data: s } = await api.get(`/api/cars/${id}/reviews/summary`);
    setSummary(s);
  }

  if (!isValidId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          Identifiant de véhicule invalide
        </p>
        <Link to="/voitures" className="mt-4 inline-block text-emerald-600">
          Retour catalogue
        </Link>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">{error || "Chargement…"}</p>
        <Link to="/voitures" className="mt-4 inline-block text-emerald-600">
          Retour catalogue
        </Link>
      </div>
    );
  }

  const lat = car.location?.lat ?? 48.8566;
  const lng = car.location?.lng ?? 2.3522;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`;

  const phone = car.seller?.phone || "";
  const wa = phone.replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            <img
              src={
                car.images?.[0] ||
                "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80"
              }
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          {car.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {car.images.slice(1, 5).map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="h-20 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Localisation
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {car.location?.city}, {car.location?.country}
            </p>
            <iframe
              title="Carte"
              className="mt-4 h-64 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800"
              src={mapSrc}
            />
          </section>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {car.brand}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {car.model}{" "}
            <span className="text-zinc-400">{car.year}</span>
          </h1>
          <p className="mt-4 text-4xl font-bold text-zinc-900 dark:text-white">
            {formatPrice(car.price)}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Note moyenne{" "}
            <span className="font-semibold text-amber-500">
              {summary.avg ? summary.avg.toFixed(1) : "—"}
            </span>{" "}
            ({summary.count || 0} avis)
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
              {car.fuel}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
              {car.transmission}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
              {car.mileage?.toLocaleString("fr-FR")} km
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
              {car.color}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
              {car.status}
            </span>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {car.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Contacter le vendeur
            </button>
            {wa && (
              <a
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
            {car.seller?.email && (
              <a
                className="rounded-2xl border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                href={`mailto:${car.seller.email}?subject=${encodeURIComponent(
                  `Intérêt pour ${car.brand} ${car.model}`
                )}`}
              >
                Email
              </a>
            )}
          </div>

          {auth.accessToken && car.status === "available" && (
            <form
              onSubmit={submitReserve}
              className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Réserver / essai
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Demande de réservation — l’admin confirme et met à jour le statut du véhicule.
              </p>
              <textarea
                className="mt-3 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                rows={3}
                placeholder="Message au vendeur"
                value={reserve.message}
                onChange={(e) =>
                  setReserve((r) => ({ ...r, message: e.target.value }))
                }
              />
              <input
                type="datetime-local"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={reserve.preferredDate}
                onChange={(e) =>
                  setReserve((r) => ({ ...r, preferredDate: e.target.value }))
                }
              />
              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Envoyer la demande
              </button>
            </form>
          )}

          {auth.accessToken && car.status === "available" && (
            <form
              onSubmit={submitCommande}
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Passer commande
              </h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Votre demande d&apos;achat est envoyée à l&apos;administrateur. Vous recevrez une notification lorsque la commande sera confirmée ou refusée.
              </p>
              <textarea
                className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm dark:border-emerald-800 dark:bg-zinc-950"
                rows={3}
                placeholder="Précisions (financement, reprise, délai…)"
                value={commande.message}
                onChange={(e) =>
                  setCommande((c) => ({ ...c, message: e.target.value }))
                }
              />
              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                Envoyer la commande à l&apos;admin
              </button>
            </form>
          )}

          {contactOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <form
                onSubmit={submitContact}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
              >
                <h3 className="text-lg font-semibold">Contacter le vendeur</h3>
                <input
                  required
                  placeholder="Nom"
                  className="mt-4 w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm((c) => ({ ...c, name: e.target.value }))
                  }
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm((c) => ({ ...c, email: e.target.value }))
                  }
                />
                <input
                  placeholder="Téléphone"
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm((c) => ({ ...c, phone: e.target.value }))
                  }
                />
                <textarea
                  placeholder="Message"
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm((c) => ({ ...c, message: e.target.value }))
                  }
                />
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border py-2 text-sm"
                    onClick={() => setContactOpen(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          )}

          <section className="mt-12">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Avis clients
            </h3>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 && (
                <p className="text-sm text-zinc-500">Pas encore d&apos;avis.</p>
              )}
              {reviews.map((rv) => (
                <div
                  key={rv._id}
                  className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                >
                  <p className="font-medium">
                    {rv.user?.first_name} {rv.user?.last_name} —{" "}
                    <span className="text-amber-500">{rv.rating}/5</span>
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                    {rv.comment}
                  </p>
                </div>
              ))}
            </div>
            {auth.accessToken && (
              <form onSubmit={submitReview} className="mt-4 space-y-2">
                <label className="text-xs font-semibold text-zinc-500">
                  Votre note
                  <select
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    value={review.rating}
                    onChange={(e) =>
                      setReview((r) => ({
                        ...r,
                        rating: Number(e.target.value),
                      }))
                    }
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  className="w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  rows={2}
                  placeholder="Commentaire"
                  value={review.comment}
                  onChange={(e) =>
                    setReview((r) => ({ ...r, comment: e.target.value }))
                  }
                />
                <button
                  type="submit"
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Publier mon avis
                </button>
              </form>
            )}
          </section>

          {auth.accessToken && (
            <section className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Chat autour de cette annonce
              </h3>
              <p className="text-xs text-zinc-500">
                Messages en temps réel via Socket.IO (salle{" "}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">car:ID</code>
                ). Historique chargé en REST.
              </p>
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-xl bg-white p-3 text-sm dark:bg-zinc-950">
                {messages.map((m) => (
                  <div key={m._id || m.id}>
                    <span className="font-semibold text-emerald-600">
                      {m.user?.first_name}:
                    </span>{" "}
                    {m.text}
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="mt-2 flex gap-2">
                <input
                  className="flex-1 rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Votre message…"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Envoyer
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
