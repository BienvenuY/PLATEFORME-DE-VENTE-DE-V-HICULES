const express = require("express");
const router = express.Router();
const verifyJWT = require("../middelwares/verifyJWT");
const isAdmin = require("../middelwares/isAdmin");
const car = require("../controllers/carController");
const reviewController = require("../controllers/reviewController");
const chatController = require("../controllers/chatController");

const reviewRouter = express.Router({ mergeParams: true });
reviewRouter.get("/", reviewController.listReviewsForCar);
reviewRouter.get("/summary", reviewController.carRatingSummary);
reviewRouter.post("/", verifyJWT, reviewController.createReview);

const chatRouter = express.Router({ mergeParams: true });
chatRouter.get("/", verifyJWT, chatController.listMessages);
chatRouter.post("/", verifyJWT, chatController.postMessage);

router.get("/featured", car.featuredCars);
router.get("/search", car.atlasSearchCars);
router.use("/:carId/reviews", reviewRouter);
router.use("/:carId/messages", chatRouter);
router.get("/", car.listCars);
router.get("/:id", car.getCarById);
router.post("/", verifyJWT, isAdmin, car.createCar);
router.put("/:id", verifyJWT, isAdmin, car.updateCar);
router.delete("/:id", verifyJWT, isAdmin, car.deleteCar);

module.exports = router;
