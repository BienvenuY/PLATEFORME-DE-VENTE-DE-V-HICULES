import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

export default function AdminReservations() {
  const [rows, setRows] = useState([]);

  async function load() {
    const { data } = await api.get("/api/reservations/all");
    setRows(data);
  }

  useEffect(() => {
    const id = setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, []);

  async function setStatus(resId, status) {
    await api.patch(`/api/reservations/${resId}/status`, { status });
    load();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Commandes & réservations
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Les <strong>commandes</strong> sont des demandes d&apos;achat à
            confirmer ; les <strong>réservations</strong> peuvent inclure une
            date préférée. Le statut met à jour la fiche véhicule et notifie le
            client.
          </p>
        </div>
        <Link
          to="/admin"
          className="text-sm font-semibold text-emerald-600 hover:underline"
        >
          ← Tableau de bord
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Véhicule</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r._id}
                className="border-t border-zinc-100 dark:border-zinc-800"
              >
                <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                  {new Date(r.createdAt).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.kind === "commande"
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                        : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800"
                    }
                  >
                    {r.kind === "commande" ? "Commande" : "Réservation"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.user?.first_name} {r.user?.last_name}
                  <div className="text-xs text-zinc-500">{r.user?.email}</div>
                </td>
                <td className="px-4 py-3">
                  {r.car ? (
                    <Link
                      to={`/voitures/${r.car._id}`}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      {r.car.brand} {r.car.model}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-600">
                  {r.message || "—"}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    value={r.status}
                    onChange={(e) => setStatus(r._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="mt-6 text-center text-zinc-500">Aucune réservation.</p>
      )}
    </div>
  );
}
