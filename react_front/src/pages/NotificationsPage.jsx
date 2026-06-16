import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);

  async function load() {
    const { data } = await api.get("/api/notifications");
    setItems(data);
  }

  useEffect(() => {
    const id = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  async function markAll() {
    await api.post("/api/notifications/read-all");
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Notifications
        </h1>
        <button
          type="button"
          onClick={markAll}
          className="text-sm font-semibold text-emerald-600 hover:underline"
        >
          Tout marquer lu
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Exemple côté Atlas&nbsp;: un trigger sur{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">cars.status</code>{" "}
        peut appeler une Function pour pousser une notification push ou email.
      </p>
      <ul className="mt-8 space-y-3">
        {items.map((n) => (
          <li
            key={n._id}
            className={`rounded-2xl border p-4 text-sm ${
              n.read
                ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                : "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30"
            }`}
          >
            <p className="font-semibold text-zinc-900 dark:text-white">{n.title}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">{n.body}</p>
            <p className="mt-2 text-xs text-zinc-400">
              {new Date(n.createdAt).toLocaleString("fr-FR")}
            </p>
          </li>
        ))}
      </ul>
      <Link to="/" className="mt-10 inline-block text-sm text-emerald-600">
        ← Accueil
      </Link>
    </div>
  );
}
