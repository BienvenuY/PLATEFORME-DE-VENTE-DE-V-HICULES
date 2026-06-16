import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        try {
          const { data } = await api.get("/api/admin/leads");
          setLeads(data);
        } catch {
          setLeads([]);
        }
      })();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Demandes de contact
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Formulaires « Contacter le vendeur » (à relier à un trigger email /
            CRM si besoin).
          </p>
        </div>
        <Link
          to="/admin"
          className="text-sm font-semibold text-emerald-600 hover:underline"
        >
          ← Tableau de bord
        </Link>
      </div>

      <ul className="mt-8 space-y-3">
        {leads.map((l) => (
          <li
            key={l._id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {l.name}{" "}
                  <span className="font-normal text-zinc-500">&lt;{l.email}&gt;</span>
                </p>
                {l.phone && (
                  <p className="text-sm text-zinc-600">Tél. {l.phone}</p>
                )}
                {l.car && (
                  <p className="mt-1 text-sm">
                    <span className="text-zinc-500">Annonce :</span>{" "}
                    <Link
                      className="text-emerald-600 hover:underline"
                      to={`/voitures/${l.car._id}`}
                    >
                      {l.car.brand} {l.car.model} ({l.car.year})
                    </Link>
                  </p>
                )}
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {l.message || "—"}
                </p>
              </div>
              <span className="text-xs text-zinc-400">
                {new Date(l.createdAt).toLocaleString("fr-FR")}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {leads.length === 0 && (
        <p className="mt-8 text-center text-zinc-500">Aucune demande.</p>
      )}
    </div>
  );
}
