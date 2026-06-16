const User = require("../models/User");
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);
};

const getFavorites = async (req, res) => {
    const user = await User.findById(req.user.id).populate({
        path: "favorites",
        populate: { path: "seller", select: "first_name last_name email phone" },
    });
    res.json(user?.favorites || []);
};

const addFavorite = async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { favorites: req.params.carId },
    });
    res.json({ ok: true });
};

const removeFavorite = async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, {
        $pull: { favorites: req.params.carId },
    });
    res.json({ ok: true });
};

const searchUsers = async (req, res) => {

    try {
        

        const { query } = req.query;

        if (!query || query.length < 3) {
            return res.status(400).json({message:"Search query must be min 3 "})
        }

const user = await User.find({first_name:{ $regex : `^${query}`, $options: `i`}}).select("-password").lean(); // Case insensitive

if(user.length === 0){
    return res.status(404).json({message: "User not found"})
}
res.json(user)


    } catch (error){
        console.error(error);
        res.status(500).json({message: "Server error"})
    }

}


module.exports = {
    getMe,
    getFavorites,
    addFavorite,
    removeFavorite,
    searchUsers
}




