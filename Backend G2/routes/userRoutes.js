
const express = require ("express");
const router = express.Router();

const userControllers = require ("../controllers/userControllers");
const verifyJWT =require ("../middelwares/verifyJWT");




router.use(verifyJWT);
router.get("/me", userControllers.getMe);
router.get("/me/favorites", userControllers.getFavorites);
router.post("/me/favorites/:carId", userControllers.addFavorite);
router.delete("/me/favorites/:carId", userControllers.removeFavorite);
router.get("/search", userControllers.searchUsers);

module.exports =router;