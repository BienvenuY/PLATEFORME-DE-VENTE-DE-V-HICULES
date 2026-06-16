const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "" },
    preferredDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    /** réservation = essai / hold ; commande = achat, à confirmer par l’admin */
    kind: {
      type: String,
      enum: ["reservation", "commande"],
      default: "reservation",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
