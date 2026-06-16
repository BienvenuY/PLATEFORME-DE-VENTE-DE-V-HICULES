import { useEffect, useState } from "react";
import { api } from "../lib/api";
import CarCard from "../components/cars/CarCard";

export default function Favorites() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/user/me/favorites");
      setCars(data);
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleFavorite(carId) {
    await api.delete(`/user/me/favorites/${carId}`);
    load();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
        Mes favoris
      </h1>
      {loading ? (
        <p className="mt-8 text-zinc-500">Chargement…</p>
      ) : cars.length === 0 ? (
        <p className="mt-8 text-zinc-500">Aucun favori pour le moment.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard
              key={car._id}
              car={car}
              favorited
              onToggleFavorite={toggleFavorite}
              isLoggedIn
            />
          ))}
        </div>
      )}
    </div>
  );
}
