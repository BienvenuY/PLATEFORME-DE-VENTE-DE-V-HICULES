/**
 * Peuple la base avec des véhicules de démo si la collection est vide.
 * Usage: node scripts/seedCars.js
 * Requiert DATABASE_URI dans .env
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db.config");
const Car = require("../models/Car");
const User = require("../models/User");

/** Photo stable (Wikimedia Commons) pour éviter les liens Unsplash bloqués ou génériques. */
const rangeRoverPhoto =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/2023_Land_Rover_Range_Rover_P530_First_Edition_1X7A6578.jpg/1024px-2023_Land_Rover_Range_Rover_P530_First_Edition_1X7A6578.jpg";

const rangeRoverSport = {
  brand: "Land Rover",
  model: "Range Rover Sport P400",
  year: 2024,
  price: 98500,
  mileage: 12400,
  fuel: "Hybride",
  transmission: "Automatique",
  color: "Santorini Black",
  description:
    "SUV premium hybride rechargeable, suspension pneumatique, Meridian™, packs Drive & Park.",
  images: [rangeRoverPhoto],
  featuredCoverImage: rangeRoverPhoto,
  location: { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  status: "available",
  featured: true,
};

const demoCars = [
  rangeRoverSport,
  {
    brand: "Peugeot",
    model: "308 GT",
    year: 2022,
    price: 24990,
    mileage: 18500,
    fuel: "Essence",
    transmission: "Automatique",
    color: "Gris Artense",
    description:
      "Berline compacte, finition GT, full LED, aide à la conduite niveau 2.",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80",
    ],
    location: { city: "Lyon", country: "France", lat: 45.764, lng: 4.8357 },
    status: "available",
    featured: true,
  },
  {
    brand: "Tesla",
    model: "Model 3",
    year: 2023,
    price: 38900,
    mileage: 12000,
    fuel: "Électrique",
    transmission: "Automatique",
    color: "Blanc Pearl",
    description: "Propulsion, autonomie WLTP ~500 km, supercharge inclus 1 an.",
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&q=80",
    ],
    location: { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
    status: "available",
    featured: true,
  },
  {
    brand: "Volkswagen",
    model: "Golf 8 R",
    year: 2021,
    price: 42990,
    mileage: 42000,
    fuel: "Essence",
    transmission: "Automatique",
    color: "Bleu Lapiz",
    description: "320 ch, 4Motion, sièges sport, Harman Kardon.",
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200&q=80",
    ],
    location: { city: "Toulouse", country: "France", lat: 43.6047, lng: 1.4442 },
    status: "reserved",
    featured: true,
  },
  {
    brand: "BMW",
    model: "320d Touring",
    year: 2020,
    price: 31990,
    mileage: 78000,
    fuel: "Diesel",
    transmission: "Automatique",
    color: "Noir Saphir",
    description: "Pack M Sport, attelage, hayon électrique.",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80",
    ],
    location: { city: "Nantes", country: "France", lat: 47.2184, lng: -1.5536 },
    status: "available",
    featured: false,
  },
  {
    brand: "Renault",
    model: "Clio V RS Line",
    year: 2023,
    price: 22490,
    mileage: 8000,
    fuel: "Essence",
    transmission: "Manuelle",
    color: "Orange Valencia",
    description: "TCe 140, sellerie mixte Alcantara, navigation 9,3 pouces.",
    images: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&q=80",
    ],
    location: { city: "Lille", country: "France", lat: 50.6292, lng: 3.0573 },
    status: "available",
    featured: false,
  },
  {
    brand: "Audi",
    model: "A4 Avant 40 TDI",
    year: 2019,
    price: 28990,
    mileage: 95000,
    fuel: "Diesel",
    transmission: "Automatique",
    color: "Gris Daytona",
    description: "Quattro, matrix LED, Virtual Cockpit.",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80",
    ],
    location: { city: "Strasbourg", country: "France", lat: 48.5734, lng: 7.7521 },
    status: "sold",
    featured: false,
  },
];

async function ensureRangeRoverFeatured(sellerId) {
  const q = { brand: /^Land Rover$/i, model: /^Range Rover Sport P400$/i };
  const existing = await Car.findOne(q);
  const payload = { ...rangeRoverSport, seller: sellerId || undefined };
  if (existing) {
    await Car.findByIdAndUpdate(existing._id, {
      $set: {
        featured: true,
        images: rangeRoverSport.images,
        featuredCoverImage: rangeRoverSport.featuredCoverImage,
        description: rangeRoverSport.description,
        price: rangeRoverSport.price,
        year: rangeRoverSport.year,
      },
    });
    console.log("Range Rover Sport : mis à jour (vedette).");
  } else {
    await Car.create(payload);
    console.log("Range Rover Sport : ajouté (vedette).");
  }
}

async function run() {
  await connectDB();
  await mongoose.connection.asPromise();
  const admin = await User.findOne({ role: "admin" });
  const anyUser = await User.findOne();
  const sellerId = admin?._id || anyUser?._id;

  const count = await Car.countDocuments();
  if (count === 0) {
    const docs = demoCars.map((c) => ({
      ...c,
      seller: sellerId || undefined,
    }));
    await Car.insertMany(docs);
    console.log(`Seed OK: ${docs.length} véhicules créés.`);
  } else {
    console.log("Des voitures existent déjà — pas d’insertion groupée.");
  }
  await ensureRangeRoverFeatured(sellerId);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
