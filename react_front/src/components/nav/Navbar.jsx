import { Link, NavLink } from "react-router";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-emerald-600/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : "text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
  }`;

export default function Navbar() {
  const { auth, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!auth.accessToken) {
      const tid = setTimeout(() => setUnread(0), 0);
      return () => clearTimeout(tid);
    }
    let t;
    async function poll() {
      try {
        const { data } = await api.get("/api/notifications");
        setUnread(data.filter((n) => !n.read).length);
      } catch {
        /* ignore */
      }
      t = setTimeout(poll, 12000);
    }
    poll();
    return () => clearTimeout(t);
  }, [auth.accessToken]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="CarsBusiness" className="h-9 w-auto" />
          <span className="hidden font-semibold tracking-tight sm:inline">
            CarsBusiness
          </span>
        </Link>

        <nav className="ml-auto flex flex-wrap items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={linkClass}>
            Accueil
          </NavLink>
          <NavLink to="/voitures" className={linkClass}>
            Voitures
          </NavLink>
          {auth.accessToken && (
            <NavLink to="/favoris" className={linkClass}>
              Favoris
            </NavLink>
          )}
          {auth.accessToken && (
            <NavLink to="/mes-reservations" className={linkClass}>
              Mes réservations
            </NavLink>
          )}
          {auth.accessToken && (
            <NavLink to="/notifications" className={linkClass}>
              Alertes
            </NavLink>
          )}
          {auth.user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2 pl-2">
          {auth.accessToken && unread > 0 && (
            <span
              className="hidden text-xs font-medium text-amber-600 sm:inline"
              title="Notifications"
            >
              {unread} non lues
            </span>
          )}
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Basculer thème"
          >
            {dark ? "Clair" : "Sombre"}
          </button>
          {auth.accessToken ? (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline">
                {auth.user?.first_name || auth.user?.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
