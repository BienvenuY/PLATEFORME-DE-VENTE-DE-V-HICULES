const User=require("../models/User");
const mongoose = require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const register = async (req, res) => {
    const first_name = String(req.body.first_name || "").trim();
    const last_name = String(req.body.last_name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            message: "Tous les champs sont obligatoires (prénom, nom, email, mot de passe).",
        });
    }

    try {
        // readyState : 0=déconnecté, 1=connecté, 2=en cours. Mongoose met en file les requêtes pendant la connexion.
        if (mongoose.connection.readyState === 0) {
            return res.status(503).json({
                message:
                    "MongoDB n'est pas connecté. Définissez DATABASE_URI (ou MONGODB_URI) dans le fichier .env du backend, redémarrez le serveur et consultez la console pour les erreurs de connexion.",
            });
        }

        const duplicatedEmail = await User.findOne({ email });
        if (duplicatedEmail) {
            return res.status(409).json({
                message: "Un compte existe déjà avec cette adresse e-mail.",
            });
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        const adminEmails = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
        const role = adminEmails.includes(email) ? "admin" : "user";

        await User.create({
            first_name,
            last_name,
            email,
            password: hashedpassword,
            role,
        });

        return res.status(201).json({ message: "Compte créé avec succès." });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Un compte existe déjà avec cette adresse e-mail.",
            });
        }
        const name = error.name || "";
        const msg = String(error.message || "");
        if (
            name === "MongoServerSelectionError" ||
            name === "MongooseServerSelectionError" ||
            msg.includes("ENOTFOUND") ||
            msg.includes("ECONNREFUSED") ||
            msg.includes("SSL") ||
            msg.includes("authentication failed")
        ) {
            return res.status(503).json({
                message:
                    "Impossible de joindre MongoDB. Vérifiez DATABASE_URI ou MONGODB_URI dans .env, le mot de passe (caractères spéciaux en encodage URL), et sur Atlas : Network Access (IP autorisées) + utilisateur de base avec les bons droits.",
            });
        }
        return res.status(500).json({
            message:
                "Erreur serveur lors de l'inscription. Vérifiez la console du backend pour le détail.",
        });
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const foundedUser = await User.findOne({ email: emailNorm });
    if (!foundedUser) {
        return res.status(401).json({ message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, foundedUser.password);
    if (!isMatch) {
        return res.status(401).json({ message: "wrong password" });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    let role = foundedUser.role || "user";
    if (adminEmails.includes(emailNorm)) {
        if (role !== "admin") {
            await User.findByIdAndUpdate(foundedUser._id, { role: "admin" });
            role = "admin";
        } else {
            role = "admin";
        }
    }

    const accessToken = jwt.sign(
        {
            userInfo: {
                id: foundedUser._id,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
    );
    const refreshToken = jwt.sign(
        {
            userInfo: {
                id: foundedUser._id,
            },
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
        accessToken,
        id: foundedUser._id,
        email: foundedUser.email,
        first_name: foundedUser.first_name,
        last_name: foundedUser.last_name,
        role,
    });
};



const refresh = (req,res) => {

const cookies = req.cookies;
if(!cookies.jwt) {
    return res.status(401).json({message: "Unothorized"})
}

const refreshToken= cookies.jwt;

jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err,decoded)=>{
    if(err) return res.status(403).json({message:"Forbidden"})
    const foundedUser = await User.findById(decoded.userInfo.id);

    if(!foundedUser) return res.status(401).json({message:"Unothorized"});

    
    const accessToken = jwt.sign({
            userInfo:{
                id:foundedUser._id,

            }
    }, process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:"30m"}
);
res.json({accessToken})

})
}


const logout = (req,res) =>{
const cookies = req.cookies;
if(!cookies.jwt) return res.sendStatus(204); // no content

res.clearCookie("jwt",{
    httpOnly:true
});
res.json({message: "User logged out"})
}

module.exports={
    register,
    login,
    refresh,
    logout
}