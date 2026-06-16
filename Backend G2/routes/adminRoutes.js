const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/verifyJWT");
const isAdmin = require("../middelwares/isAdmin");
const adminController = require("../controllers/adminController");
const { uploadImage } = require("../controllers/uploadController");

router.use(verifyJWT, isAdmin);
router.get("/stats", adminController.stats);
router.get("/users", adminController.listUsers);
router.delete("/users/:id", adminController.deleteUser);
router.get("/cars", adminController.listAllCarsAdmin);
router.patch("/cars/:id/spotlight", adminController.patchCarSpotlight);
router.get("/leads", adminController.listContactLeads);
router.post("/upload", ...uploadImage);

module.exports = router;
