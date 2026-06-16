const mongoose = require("mongoose");
const Review = require("../models/Review");
const Car = require("../models/Car");

const listReviewsForCar = async (req, res) => {
  const reviews = await Review.find({ car: req.params.carId })
    .populate("user", "first_name last_name")
    .sort({ createdAt: -1 });
  res.json(reviews);
};

const createReview = async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId);
    if (!car) return res.status(404).json({ message: "Voiture introuvable" });
    const review = await Review.create({
      car: req.params.carId,
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment || "",
    });
    const populated = await Review.findById(review._id).populate(
      "user",
      "first_name last_name"
    );
    res.status(201).json(populated);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: "Vous avez déjà noté ce véhicule" });
    }
    res.status(400).json({ message: "Avis invalide" });
  }
};

const carRatingSummary = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.carId)) {
    return res.status(400).json({ message: "ID invalide" });
  }
  const agg = await Review.aggregate([
    { $match: { car: new mongoose.Types.ObjectId(req.params.carId) } },
    {
      $group: {
        _id: "$car",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(agg[0] || { avg: 0, count: 0 });
};

module.exports = {
  listReviewsForCar,
  createReview,
  carRatingSummary,
};
