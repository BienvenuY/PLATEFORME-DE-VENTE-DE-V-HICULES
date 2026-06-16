import { Link } from "react-router";

function formatPrice(n) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function HeartIcon({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/**
 * @param {boolean} isLoggedIn
 * @param {(id: string) => void} [onToggleFavorite]
 * @param {boolean} [favorited]
 * @param {boolean} [preferHomeCover] — accueil : utilise `featuredCoverImage` si définie
 */
export default function CarCard({
  car,
  onToggleFavorite,
  favorited,
  isLoggedIn,
  preferHomeCover,
}) {
  const img =
    (preferHomeCover && car.featuredCoverImage) ||
    car.images?.[0] ||
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <Link to={`/voitures/${car._id}`} className="relative block aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={img}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {car.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            Vedette
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
          {car.year}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              {car.brand}
            </p>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {car.model}
            </h3>
          </div>
          <p className="text-right text-lg font-bold text-zinc-900 dark:text-white">
            {formatPrice(car.price)}
          </p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {car.description || "—"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {car.fuel}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {car.transmission}
          </span>
          {car.location?.city && (
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              {car.location.city}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/voitures/${car._id}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Détails
          </Link>
          {isLoggedIn && onToggleFavorite ? (
            <button
              type="button"
              onClick={() => onToggleFavorite(car._id)}
              className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 ${
                favorited
                  ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                  : "border-zinc-200 text-zinc-500 hover:border-rose-300 hover:text-rose-500 dark:border-zinc-700 dark:hover:text-rose-400"
              }`}
              aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              title="Favoris"
            >
              <HeartIcon filled={!!favorited} />
            </button>
          ) : (
            <Link
              to="/login"
              state={{ from: `/voitures/${car._id}` }}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-3 py-2 text-zinc-500 hover:border-rose-300 hover:text-rose-500 dark:border-zinc-700"
              aria-label="Connexion pour favoris"
              title="Connectez-vous pour ajouter aux favoris"
            >
              <HeartIcon filled={false} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
