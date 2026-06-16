import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import CarCard from "../components/cars/CarCard";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { auth } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/api/cars/featured");
        if (!cancelled) setFeatured(data);
      } catch {
        if (!cancelled) setFeatured([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 text-white dark:border-zinc-800">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
            Occasion sélectionnée · France
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Trouvez la voiture qu&apos;il vous faut, sans friction.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-300">
            Catalogue, filtres, favoris, contact vendeur, commande ou réservation
            — connexion requise pour consulter les annonces.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/voitures"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-900/40 hover:bg-emerald-400"
            >
              {auth.accessToken ? "Parcourir le catalogue" : "Voir les voitures (connexion)"}
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Sélection du moment
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Véhicules mis en avant par l&apos;équipe.
            </p>
          </div>
          <Link
            to="/voitures"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            Tout voir →
          </Link>
        </div>

        {loading ? (
          <p className="mt-10 text-center text-zinc-500">Chargement…</p>
        ) : featured.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
            <p className="font-medium">Aucune voiture vedette pour le moment.</p>
            <p className="mt-2 text-sm">
              Lancez le backend, configurez <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">DATABASE_URI</code> puis{" "}
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">npm run seed</code> dans le dossier backend.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                preferHomeCover
                isLoggedIn={!!auth.accessToken}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-zinc-200 bg-white py-14 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Nos univers
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
            Berlines premium, SUV haut de gamme et 4×4 : le type de véhicules que vous retrouvez dans notre catalogue.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "BMW Série 3",
                desc: "Berline sportive, finitions modernes et confort route pour un quotidien exigeant.",
                img: "/showcase/bmw-serie-3.png",
              },
              {
                title: "Range Rover",
                desc: "SUV de luxe, silhouette affirmée et technologies pour voyager sereinement.",
                img: "/showcase/range-rover.png",
              },
              {
                title: "Toyota Land Cruiser",
                desc: "4×4 iconique, esprit aventure et robustesse pour tous les terrains.",
                img: "/showcase/land-cruiser.png",
              },
            ].map((x) => (
              <article
                key={x.title}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="aspect-[4/3] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  <img
                    src={x.img}
                    alt={x.title}
                    className="h-full w-full object-cover object-center transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{x.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{x.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
