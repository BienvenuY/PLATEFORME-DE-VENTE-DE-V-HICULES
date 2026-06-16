const Reservation = require("../models/Reservation");
const Car = require("../models/Car");
const Notification = require("../models/Notification");

const createReservation = async (req, res) => {
  try {
    const car = await Car.findById(req.body.car);
    if (!car || car.status === "sold") {
      return res.status(400).json({ message: "Véhicule indisponible" });
    }
    const kind =
      req.body.kind === "commande" ? "commande" : "reservation";
    const reservation = await Reservation.create({
      car: req.body.car,
      user: req.user.id,
      message: req.body.message || "",
      preferredDate: req.body.preferredDate || undefined,
      kind,
    });
    const isCommande = kind === "commande";
    await Notification.create({
      user: req.user.id,
      title: isCommande
        ? "Commande envoyée"
        : "Demande de réservation envoyée",
      body: `${car.brand} ${car.model} — en attente de confirmation admin.`,
      type: "reservation",
    });
    const populated = await Reservation.findById(reservation._id)
      .populate("car")
      .populate("user", "first_name last_name email");
    res.status(201).json(populated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Impossible de réserver" });
  }
};

const listMyReservations = async (req, res) => {
  const list = await Reservation.find({ user: req.user.id })
    .populate("car")
    .sort({ createdAt: -1 });
  res.json(list);
};

const listAllReservations = async (req, res) => {
  const list = await Reservation.find()
    .populate("car")
    .populate("user", "first_name last_name email")
    .sort({ createdAt: -1 });
  res.json(list);
};

const updateReservationStatus = async (req, res) => {
  const { status } = req.body;
  const r = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  )
    .populate("car")
    .populate("user", "first_name last_name email");
  if (!r) return res.status(404).json({ message: "Introuvable" });

  if (r.user) {
    const label = r.kind === "commande" ? "Commande" : "Réservation";
    await Notification.create({
      user: r.user._id,
      title: `Mise à jour — ${label}`,
      body: `Statut: ${status} pour ${r.car?.brand} ${r.car?.model}`,
      type: "reservation",
    });
  }
  if (status === "confirmed" && r.car) {
    await Car.findByIdAndUpdate(r.car._id, { status: "reserved" });
  }
  if (status === "completed" && r.car) {
    await Car.findByIdAndUpdate(r.car._id, { status: "sold" });
  }
  res.json(r);
};

module.exports = {
  createReservation,
  listMyReservations,
  listAllReservations,
  updateReservationStatus,
};
