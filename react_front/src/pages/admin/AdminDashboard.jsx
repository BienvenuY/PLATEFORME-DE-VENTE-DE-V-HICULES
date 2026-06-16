import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/admin/stats");
        setStats(data);
      } catch {
        setStats(null);
      }
    })();
  }, []);

  if (!stats) {
    return (
      <div className="px-4 py-10 sm:px-6">
        <p className="text-zinc-500">Chargement du tableau de bord…</p>
      </div>
    );
  }

  const cards = [
    { label: "Voitures", value: stats.totalCars },
    { label: "Utilisateurs", value: stats.totalUsers },
    { label: "Réservations", value: stats.totalReservations },
    { label: "Ventes (statut vendu)", value: stats.sales },
    { label: "Disponibles", value: stats.available },
    {
      label: "CA indicatif (somme prix vendus)",
      value: `${(stats.soldRevenue || 0).toLocaleString("fr-FR")} €`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
        Administration
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Statistiques agrégées depuis MongoDB. Les triggers Atlas peuvent
        alimenter des notifications temps réel en complément.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-semibold uppercase text-zinc-500">
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
              {c.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          to="/admin/reservations"
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Commandes & réservations
        </Link>
        <Link
          to="/admin/utilisateurs"
          className="rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-600"
        >
          Utilisateurs
        </Link>
        <Link
          to="/admin/contacts"
          className="rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-800"
        >
          Contacts vendeur
        </Link>
        <Link
          to="/admin/accueil-vedette"
          className="rounded-xl border border-amber-500 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/70"
        >
          Vedette page d&apos;accueil
        </Link>
        <Link
          to="/admin/voitures"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Gérer les voitures
        </Link>
        <Link
          to="/admin/voitures/nouveau"
          className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold dark:border-zinc-600"
        >
          Ajouter une voiture
        </Link>
      </div>
    </div>
  );
}
