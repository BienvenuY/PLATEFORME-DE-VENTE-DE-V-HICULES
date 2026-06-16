const User = require("../models/User");

module.exports = async function isAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
