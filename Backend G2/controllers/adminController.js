const Car = require("../models/Car");
const User = require("../models/User");
const Reservation = require("../models/Reservation");
const ContactLead = require("../models/ContactLead");

const stats = async (req, res) => {
  try {
    const [
      totalCars,
      totalUsers,
      totalReservations,
      sales,
      available,
      revenueHint,
    ] = await Promise.all([
      Car.countDocuments(),
      User.countDocuments(),
      Reservation.countDocuments(),
      Car.countDocuments({ status: "sold" }),
      Car.countDocuments({ status: "available" }),
      Car.aggregate([
        { $match: { status: "sold" } },
        { $group: { _id: null, sum: { $sum: "$price" } } },
      ]),
    ]);
    const soldRevenue = revenueHint[0]?.sum || 0;
    res.json({
      totalCars,
      totalUsers,
      totalReservations,
      sales,
      available,
      soldRevenue,
    });
  } catch (e) {
    res.status(500).json({ message: "Erreur stats" });
  }
};

const listAllCarsAdmin = async (req, res) => {
  const cars = await Car.find()
    .populate("seller", "first_name last_name email phone")
    .sort({ createdAt: -1 })
    .lean();
  res.json(cars);
};

const listContactLeads = async (req, res) => {
  const leads = await ContactLead.find()
    .populate("car", "brand model year price")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json(leads);
};

const listUsers = async (req, res) => {
  const users = await User.find()
    .select("first_name last_name email role createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json(users);
};

const deleteUser = async (req, res) => {
  const targetId = req.params.id;
  if (String(targetId) === String(req.user.id)) {
    return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte depuis cette liste." });
  }
  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ message: "Utilisateur introuvable" });
  await User.findByIdAndDelete(targetId);
  res.json({ message: "Utilisateur supprimé" });
};

/** Met à jour uniquement la vedette accueil (featured + image de couverture). */
const patchCarSpotlight = async (req, res) => {
  try {
    const { featured, featuredCoverImage } = req.body;
    const $set = {};
    if (typeof featured === "boolean") $set.featured = featured;
    if (featuredCoverImage !== undefined) {
      $set.featuredCoverImage =
        typeof featuredCoverImage === "string" ? featuredCoverImage.trim() : "";
    }
    if (Object.keys($set).length === 0) {
      return res.status(400).json({ message: "Aucun champ à mettre à jour." });
    }
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true, runValidators: true }
    ).populate("seller", "first_name last_name email phone");
    if (!car) return res.status(404).json({ message: "Voiture introuvable" });
    res.json(car);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Mise à jour impossible" });
  }
};

module.exports = {
  stats,
  listAllCarsAdmin,
  listContactLeads,
  listUsers,
  deleteUser,
  patchCarSpotlight,
};
