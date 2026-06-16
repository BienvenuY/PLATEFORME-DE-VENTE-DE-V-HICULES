import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { api } from "../../lib/api";

const empty = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  fuel: "Essence",
  transmission: "Manuelle",
  color: "",
  description: "",
  images: [],
  location: { city: "", country: "France", lat: 48.8566, lng: 2.3522 },
  status: "available",
  featured: false,
  featuredCoverImage: "",
};

/** Sans Cloudinary : images stockées en data URL (limite pour ne pas saturer MongoDB). */
const MAX_LOCAL_IMAGE_BYTES = 900 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Lecture fichier impossible"));
    r.readAsDataURL(file);
  });
}

export default function AdminCarForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isNew = location.pathname.endsWith("/nouveau");
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (isNew || !id) return;
    (async () => {
      const { data } = await api.get(`/api/cars/${id}`);
      setForm({
        brand: data.brand,
        model: data.model,
        year: data.year,
        price: data.price,
        mileage: data.mileage,
        fuel: data.fuel,
        transmission: data.transmission,
        color: data.color,
        description: data.description,
        images: data.images || [],
        location: data.location || empty.location,
        status: data.status,
        featured: !!data.featured,
        featuredCoverImage: data.featuredCoverImage || "",
      });
    })();
  }, [id, isNew]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setLoc(k, v) {
    setForm((f) => ({
      ...f,
      location: { ...f.location, [k]: v },
    }));
  }

  function removeImage(url) {
    setForm((f) => ({
      ...f,
      images: f.images.filter((u) => u !== url),
    }));
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) {
      if (fileList?.length) {
        alert("Choisissez des fichiers image (JPEG, PNG, WebP, GIF…).");
      }
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        let url = null;
        try {
          const body = new FormData();
          body.append("image", file);
          // Ne pas fixer Content-Type : Axios doit ajouter le boundary multipart.
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
                `${file.name} : fichier trop lourd pour l’enregistrement sans Cloudinary (max ~${Math.round(MAX_LOCAL_IMAGE_BYTES / 1024)} Ko). Réduisez la taille ou configurez Cloudinary dans le .env du backend.`
              );
              continue;
            }
            try {
              url = await readFileAsDataUrl(file);
            } catch {
              alert(`Impossible de lire ${file.name}.`);
              continue;
            }
          } else {
            alert(
              err.response?.data?.message ||
                "Upload refusé. Vérifiez que vous êtes connecté en admin."
            );
            continue;
          }
        }
        if (url) {
          setForm((f) => ({ ...f, images: [...f.images, url] }));
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /** Une seule image pour la couverture accueil (champ `featuredCoverImage`). */
  async function uploadFeaturedCover(file) {
    if (!file?.type?.startsWith("image/")) return;
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
              `${file.name} : fichier trop lourd pour l’enregistrement sans Cloudinary (max ~${Math.round(MAX_LOCAL_IMAGE_BYTES / 1024)} Ko).`
            );
            return;
          }
          try {
            url = await readFileAsDataUrl(file);
          } catch {
            alert(`Impossible de lire ${file.name}.`);
            return;
          }
        } else {
          alert(
            err.response?.data?.message ||
              "Upload refusé. Vérifiez que vous êtes connecté en admin."
          );
          return;
        }
      }
      if (url) set("featuredCoverImage", url);
    } finally {
      setUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  function addUrl() {
    if (!imageUrl.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, imageUrl.trim()] }));
    setImageUrl("");
  }

  async function save(e) {
    e.preventDefault();
    const payload = {
      ...form,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      location: {
        ...form.location,
        lat: Number(form.location.lat),
        lng: Number(form.location.lng),
      },
      featuredCoverImage: form.featured ? (form.featuredCoverImage || "").trim() : "",
    };
    if (!payload.featured) {
      payload.featuredCoverImage = "";
    }
    if (isNew) {
      await api.post("/api/cars", payload);
    } else {
      await api.put(`/api/cars/${id}`, payload);
    }
    navigate("/admin/voitures");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        {isNew ? "Nouvelle voiture" : "Modifier l’annonce"}
      </h1>
      <form onSubmit={save} className="mt-8 space-y-4">
        {["brand", "model", "color", "description"].map((field) => (
          <label
            key={field}
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {field}
            {field === "description" ? (
              <textarea
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                rows={3}
                value={form[field]}
                onChange={(e) => set(field, e.target.value)}
              />
            ) : (
              <input
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                value={form[field]}
                onChange={(e) => set(field, e.target.value)}
                required={field !== "color"}
              />
            )}
          </label>
        ))}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Année
            <input
              type="number"
              className="mt-1 w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
            />
          </label>
          <label className="text-sm font-medium">
            Prix (€)
            <input
              type="number"
              className="mt-1 w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </label>
          <label className="text-sm font-medium">
            Kilométrage
            <input
              type="number"
              className="mt-1 w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              value={form.mileage}
              onChange={(e) => set("mileage", e.target.value)}
            />
          </label>
          <label className="text-sm font-medium">
            Statut
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="available">Disponible</option>
              <option value="reserved">Réservé</option>
              <option value="sold">Vendu</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Carburant
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              value={form.fuel}
              onChange={(e) => set("fuel", e.target.value)}
            >
              {["Essence", "Diesel", "Hybride", "Électrique", "GPL"].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Boîte
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              value={form.transmission}
              onChange={(e) => set("transmission", e.target.value)}
            >
              <option value="Manuelle">Manuelle</option>
              <option value="Automatique">Automatique</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Mise en avant (page d&apos;accueil)
        </label>

        {form.featured && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/25">
            <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
              Photo dédiée pour l&apos;accueil (optionnel)
            </p>
            <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
              Si renseignée, cette image s&apos;affiche sur la grille « Sélection du
              moment » à la place de la première photo.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void uploadFeaturedCover(e.target.files?.[0])}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => coverInputRef.current?.click()}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {uploading ? "…" : "Téléverser"}
              </button>
              {form.featuredCoverImage && (
                <button
                  type="button"
                  onClick={() => set("featuredCoverImage", "")}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-xs dark:border-zinc-600"
                >
                  Effacer
                </button>
              )}
            </div>
            {form.featuredCoverImage && (
              <img
                src={form.featuredCoverImage}
                alt=""
                className="mt-3 h-28 max-w-xs rounded-lg border border-amber-200 object-cover dark:border-amber-900"
              />
            )}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Photos de la voiture
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Depuis votre PC : plusieurs images possibles. Avec Cloudinary dans le
            backend, les fichiers sont envoyés au cloud. Sinon, les photos sont
            intégrées en base (limite ~900 Ko par fichier).
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/*"
            multiple
            className="sr-only"
            onChange={(e) => void handleFiles(e.target.files)}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              {uploading ? "Traitement…" : "Choisir des photos sur mon ordinateur"}
            </button>
            <span className="text-xs text-zinc-500">ou glissez-déposez ci-dessous</span>
          </div>

          <div
            role="presentation"
            onDragEnter={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
              void handleFiles(e.dataTransfer.files);
            }}
            className={`mt-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragOver
                ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30"
                : "border-zinc-300 bg-zinc-50/50 dark:border-zinc-600 dark:bg-zinc-900/40"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Déposez vos images ici
            </p>
            <p className="mt-1 text-xs text-zinc-500">JPEG, PNG, WebP, GIF</p>
          </div>

          {form.images.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
                Aperçu ({form.images.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {form.images.map((url) => (
                  <div key={url} className="group relative">
                    <img
                      src={url}
                      alt=""
                      className="h-24 w-36 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow hover:bg-rose-500"
                      aria-label="Retirer cette photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <p className="text-xs font-medium text-zinc-500">
              Ou ajouter une image par lien (URL)
            </p>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="https://…"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={addUrl}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
              >
                Ajouter l’URL
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-semibold">Localisation</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Ville"
              value={form.location.city}
              onChange={(e) => setLoc("city", e.target.value)}
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="Pays"
              value={form.location.country}
              onChange={(e) => setLoc("country", e.target.value)}
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="lat"
              value={form.location.lat}
              onChange={(e) => setLoc("lat", e.target.value)}
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="lng"
              value={form.location.lng}
              onChange={(e) => setLoc("lng", e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
