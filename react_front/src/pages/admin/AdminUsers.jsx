import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  async function load() {
    const { data } = await api.get("/api/admin/users");
    setUsers(data);
  }

  useEffect(() => {
    const id = setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, []);

  async function remove(userId, email) {
    if (!confirm(`Supprimer l’utilisateur ${email} ? Cette action est définitive.`)) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Suppression impossible");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Liste des comptes (email visible). Vous pouvez supprimer un compte
            sauf le vôtre depuis cette interface.
          </p>
        </div>
        <Link
          to="/admin"
          className="text-sm font-semibold text-emerald-600 hover:underline"
        >
          ← Tableau de bord
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {users.map((u) => (
          <li
            key={u._id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
          >
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">
                {u.first_name} {u.last_name}
              </p>
              <a
                href={`mailto:${u.email}`}
                className="text-sm text-emerald-600 hover:underline"
              >
                {u.email}
              </a>
              <p className="mt-1 text-xs text-zinc-500">
                Rôle : {u.role || "user"} · Inscrit le{" "}
                {u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("fr-FR")
                  : "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(u._id, u.email)}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      {users.length === 0 && (
        <p className="mt-8 text-center text-zinc-500">Aucun utilisateur.</p>
      )}
    </div>
  );
}
