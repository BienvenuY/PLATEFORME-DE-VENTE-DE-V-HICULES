import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api } from "../lib/api";
import CarCard from "../components/cars/CarCard";
import { useAuth } from "../context/AuthContext";

const fuels = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"];
const transmissions = ["Manuelle", "Automatique"];

export default function Cars() {
  const { auth } = useAuth();
  const [params, setParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favSet, setFavSet] = useState(() => new Set());

  const q = params.get("q") || "";
  const brand = params.get("brand") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const minYear = params.get("minYear") || "";
  const maxYear = params.get("maxYear") || "";
  const fuel = params.get("fuel") || "";
  const transmission = params.get("transmission") || "";
  const sort = params.get("sort") || "";
  const useAtlas = params.get("atlas") === "1";

  const setField = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const loadFavorites = useCallback(async () => {
    if (!auth.accessToken) {
      setFavSet(new Set());
      return;
    }
    try {
      const { data } = await api.get("/user/me/favorites");
      setFavSet(new Set(data.map((c) => c._id)));
    } catch {
      setFavSet(new Set());
    }
  }, [auth.accessToken]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const search = new URLSearchParams();
        if (q) search.set("q", q);
        if (brand) search.set("brand", brand);
        if (minPrice) search.set("minPrice", minPrice);
        if (maxPrice) search.set("maxPrice", maxPrice);
        if (minYear) search.set("minYear", minYear);
        if (maxYear) search.set("maxYear", maxYear);
        if (fuel) search.set("fuel", fuel);
        if (transmission) search.set("transmission", transmission);
        if (sort) search.set("sort", sort);
        const path = useAtlas
          ? `/api/cars/search?${search}`
          : `/api/cars?${search}`;
        const { data } = await api.get(path);
        if (!cancelled) setCars(data);
      } catch {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, brand, minPrice, maxPrice, minYear, maxYear, fuel, transmission, sort, useAtlas]);

  async function toggleFavorite(id) {
    if (!auth.accessToken) return;
    try {
      if (favSet.has(id)) {
        await api.delete(`/user/me/favorites/${id}`);
        setFavSet((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      } else {
        await api.post(`/user/me/favorites/${id}`);
        setFavSet((s) => new Set(s).add(id));
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Catalogue
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Filtres classiques ou endpoint{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">/api/cars/search</code>{" "}
        (Atlas Search si activé sur le serveur).
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-72 lg:shrink-0">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <label className="block text-xs font-semibold uppercase text-zinc-500">
              Recherche texte
              <input
                value={q}
                onChange={(e) => setField("q", e.target.value)}
                placeholder="Marque, modèle…"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-xs font-semibold uppercase text-zinc-500">
              Marque
              <input
                value={brand}
                onChange={(e) => setField("brand", e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Prix min
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setField("minPrice", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Prix max
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setField("maxPrice", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Année min
                <input
                  type="number"
                  value={minYear}
                  onChange={(e) => setField("minYear", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Année max
                <input
                  type="number"
                  value={maxYear}
                  onChange={(e) => setField("maxYear", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </div>
            <label className="block text-xs font-semibold uppercase text-zinc-500">
              Carburant
              <select
                value={fuel}
                onChange={(e) => setField("fuel", e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">Tous</option>
                {fuels.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase text-zinc-500">
              Boîte
              <select
                value={transmission}
                onChange={(e) => setField("transmission", e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">Toutes</option>
                {transmissions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase text-zinc-500">
              Tri
              <select
                value={sort}
                onChange={(e) => setField("sort", e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">Récent</option>
                <option value="price_asc">Prix ↑</option>
                <option value="price_desc">Prix ↓</option>
                <option value="year_desc">Année ↓</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={useAtlas}
                onChange={(e) => setField("atlas", e.target.checked ? "1" : "")}
              />
              Utiliser <span className="font-mono">/search</span> (Atlas)
            </label>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <p className="text-zinc-500">Chargement…</p>
          ) : cars.length === 0 ? (
            <p className="text-zinc-500">Aucun résultat.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
              {cars.map((car) => (
                <CarCard
                  key={car._id}
                  car={car}
                  favorited={favSet.has(car._id)}
                  onToggleFavorite={toggleFavorite}
                  isLoggedIn
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
