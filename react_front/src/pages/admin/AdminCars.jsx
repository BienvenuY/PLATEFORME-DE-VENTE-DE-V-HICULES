import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";

export default function AdminCars() {
  const [cars, setCars] = useState([]);

  async function load() {
    const { data } = await api.get("/api/admin/cars");
    setCars(data);
  }

  useEffect(() => {
    const id = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  async function remove(id) {
    if (!confirm("Supprimer cette annonce ?")) return;
    await api.delete(`/api/cars/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Voitures (admin)
        </h1>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/accueil-vedette"
            className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          >
            Vedette accueil
          </Link>
          <Link
            to="/admin/utilisateurs"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-600"
          >
            Utilisateurs
          </Link>
          <Link
            to="/admin/reservations"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-600"
          >
            Commandes
          </Link>
          <Link
            to="/admin/contacts"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-600"
          >
            Contacts
          </Link>
          <Link
            to="/admin/voitures/nouveau"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Nouvelle annonce
          </Link>
        </div>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-3">Marque / Modèle</th>
              <th className="px-4 py-3">Année</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Accueil</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => (
              <tr
                key={c._id}
                className="border-t border-zinc-100 dark:border-zinc-800"
              >
                <td className="px-4 py-3 font-medium">
                  {c.brand} {c.model}
                </td>
                <td className="px-4 py-3">{c.year}</td>
                <td className="px-4 py-3">
                  {c.price?.toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">
                  {c.featured ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      Vedette
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/voitures/${c._id}`}
                    className="text-emerald-600 hover:underline"
                  >
                    Modifier
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(c._id)}
                    className="ml-4 text-rose-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
