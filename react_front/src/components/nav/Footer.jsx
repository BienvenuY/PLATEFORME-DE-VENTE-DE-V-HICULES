import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-10 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            CarsBusiness
          </p>
          <p className="mt-1 max-w-md">
            Achat et vente de véhicules d&apos;occasion et neufs. Recherche
            avancée, favoris, réservation et espace vendeur.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/voitures" className="hover:text-emerald-600 dark:hover:text-emerald-400">
            Catalogue
          </Link>
          <a
            href="https://www.mongodb.com/atlas"
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            MongoDB Atlas
          </a>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-zinc-400">
        Démo pédagogique — branchez votre cluster Atlas et Cloudinary via{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">.env</code>.
      </p>
    </footer>
  );
}
