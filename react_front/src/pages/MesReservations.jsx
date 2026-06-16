import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";

const labels = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

export default function MesReservations() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const tid = setTimeout(() => {
      void (async () => {
        const { data } = await api.get("/api/reservations/mine");
        setRows(data);
      })();
    }, 0);
    return () => clearTimeout(tid);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Mes commandes & réservations
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Commandes d&apos;achat et demandes de réservation — notification quand
        l&apos;admin change le statut.
      </p>
      <ul className="mt-8 space-y-4">
        {rows.map((r) => (
          <li
            key={r._id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              {r.car ? (
                <Link
                  to={`/voitures/${r.car._id}`}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  {r.car.brand} {r.car.model}
                </Link>
              ) : (
                <span className="font-medium">Véhicule supprimé</span>
              )}
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
                {labels[r.status] || r.status}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {r.kind === "commande" ? "Commande d’achat" : "Réservation / essai"}
            </p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {r.message || "Pas de message"}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              Demandé le {new Date(r.createdAt).toLocaleString("fr-FR")}
            </p>
          </li>
        ))}
      </ul>
      {rows.length === 0 && (
        <p className="mt-8 text-center text-zinc-500">
          Aucune réservation.{" "}
          <Link to="/voitures" className="text-emerald-600 hover:underline">
            Parcourir le catalogue
          </Link>
        </p>
      )}
    </div>
  );
}
