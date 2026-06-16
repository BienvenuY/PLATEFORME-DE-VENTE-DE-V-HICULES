import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";

const MAX_LOCAL_IMAGE_BYTES = 900 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Lecture fichier impossible"));
    r.readAsDataURL(file);
  });
}

export default function AdminHomeSpotlight() {
  const [cars, setCars] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [featuredCoverImage, setFeaturedCoverImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const fileRef = useRef(null);

  async function loadCars() {
    const { data } = await api.get("/api/admin/cars");
    setCars(data);
  }

  useEffect(() => {
    void loadCars();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setFeatured(false);
      setFeaturedCoverImage("");
      return;
    }
    const c = cars.find((x) => String(x._id) === String(selectedId));
    if (c) {
      setFeatured(!!c.featured);
      setFeaturedCoverImage(c.featuredCoverImage || "");
    }
  }, [selectedId, cars]);

  async function handleFile(file) {
    if (!file?.type?.startsWith("image/")) {
      alert("Choisissez une image (JPEG, PNG, WebP…).");
      return;
    }
    setUploading(true);
    try {
      let url = null;
      try {
        const body = new FormData();
        body.append("image", file);
        const { data } = await api.post("/api/admin/upload", body);
        url = data.url;
      } catch (err) {
        const status = err.response?.status;
        const noCloud =
          status === 503 ||
          (err.response?.data?.message || "").includes("Cloudinary");
        if (noCloud || status === 500 || !err.response) {
          if (file.size > MAX_LOCAL_IMAGE_BYTES) {
            alert(
              `Fichier trop lourd sans Cloudinary (max ~${Math.round(MAX_LOCAL_IMAGE_BYTES / 1024)} Ko).`
            );
            return;
          }
          url = await readFileAsDataUrl(file);
        } else {
          alert(err.response?.data?.message || "Upload refusé.");
          return;
        }
      }
      if (url) setFeaturedCoverImage(url);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(e) {
    e.preventDefault();
    if (!selectedId) {
      setMessage({ type: "err", text: "Choisissez une voiture." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.patch(`/api/admin/cars/${selectedId}/spotlight`, {
        featured,
        featuredCoverImage,
      });
      setMessage({ type: "ok", text: "Enregistré. L’accueil affichera cette voiture si elle est marquée vedette et disponible / réservée." });
      await loadCars();
    } catch (err) {
      setMessage({
        type: "err",
        text: err.response?.data?.message || "Erreur lors de l’enregistrement.",
      });
    } finally {
      setSaving(false);
    }
  }

  const selected = cars.find((c) => String(c._id) === String(selectedId));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Vedette accueil
        </h1>
        <Link
          to="/admin/voitures"
          className="text-sm font-semibold text-emerald-600 hover:underline"
        >
          ← Liste des voitures
        </Link>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Choisissez une annonce, activez la mise en avant et ajoutez une photo dédiée
        pour la section « Sélection du moment » sur la page d&apos;accueil (sans
        modifier le reste de l&apos;annonce).
      </p>

      <form onSubmit={save} className="mt-8 space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Voiture
          <select
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">— Sélectionner —</option>
            {cars.map((c) => (
              <option key={c._id} value={c._id}>
                {c.brand} {c.model} ({c.year}) — {c.status}
                {c.featured ? " ★ vedette" : ""}
              </option>
            ))}
          </select>
        </label>

        {selected && (
          <p className="text-xs text-zinc-500">
            Édition complète :{" "}
            <Link className="text-emerald-600 hover:underline" to={`/admin/voitures/${selected._id}`}>
              ouvrir le formulaire annonce
            </Link>
          </p>
        )}

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Afficher sur la page d&apos;accueil (vedette)
        </label>

        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            Photo pour l&apos;accueil
          </p>
          <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
            Cette image remplace la première photo du véhicule uniquement sur
            l&apos;accueil. Si vous la laissez vide, la première photo de
            l&apos;annonce sera utilisée.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading || !selectedId}
              onClick={() => fileRef.current?.click()}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {uploading ? "Envoi…" : "Téléverser une image"}
            </button>
            {featuredCoverImage && (
              <button
                type="button"
                onClick={() => setFeaturedCoverImage("")}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
              >
                Retirer l&apos;image accueil
              </button>
            )}
          </div>
          {featuredCoverImage && (
            <div className="mt-4">
              <img
                src={featuredCoverImage}
                alt="Aperçu vedette"
                className="max-h-56 w-full max-w-md rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
              />
            </div>
          )}
        </div>

        {message && (
          <p
            className={
              message.type === "ok"
                ? "text-sm text-emerald-700 dark:text-emerald-400"
                : "text-sm text-rose-600"
            }
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !selectedId}
          className="w-full rounded-2xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {saving ? "Enregistrement…" : "Enregistrer sur l’accueil"}
        </button>
      </form>
    </div>
  );
}
