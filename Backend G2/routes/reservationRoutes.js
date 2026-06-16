const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/verifyJWT");
const isAdmin = require("../middelwares/isAdmin");
const reservationController = require("../controllers/reservationController");

router.post("/", verifyJWT, reservationController.createReservation);
router.get("/mine", verifyJWT, reservationController.listMyReservations);
router.get("/all", verifyJWT, isAdmin, reservationController.listAllReservations);
router.patch(
  "/:id/status",
  verifyJWT,
  isAdmin,
  reservationController.updateReservationStatus
);

module.exports = router;
