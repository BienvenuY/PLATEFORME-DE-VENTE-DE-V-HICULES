const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/verifyJWT");
const notificationController = require("../controllers/notificationController");

router.use(verifyJWT);
router.get("/", notificationController.listMine);
router.post("/read-all", notificationController.markRead);

module.exports = router;
