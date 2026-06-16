const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true },
    year: { type: Number, required: true, index: true },
    price: { type: Number, required: true, index: true },
    mileage: { type: Number, default: 0 },
    fuel: {
      type: String,
      enum: ["Essence", "Diesel", "Hybride", "Électrique", "GPL"],
      default: "Essence",
      index: true,
    },
    transmission: {
      type: String,
      enum: ["Manuelle", "Automatique"],
      default: "Manuelle",
      index: true,
    },
    color: { type: String, default: "" },
    description: { type: String, default: "" },
    images: [{ type: String }],
    /** Image dédiée pour la grille « Sélection du moment » (accueil). Si vide, la 1ʳᵉ photo du véhicule est utilisée. */
    featuredCoverImage: { type: String, default: "" },
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "France" },
      lat: { type: Number, default: 48.8566 },
      lng: { type: Number, default: 2.3522 },
    },
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
      index: true,
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

carSchema.index({ brand: 1, model: 1, year: 1 });

module.exports = mongoose.model("Car", carSchema);
