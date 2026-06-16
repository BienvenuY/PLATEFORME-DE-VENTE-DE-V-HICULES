const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const uploadImage = [
  upload.single("image"),
  async (req, res) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res
        .status(503)
        .json({ message: "Cloudinary non configuré (CLOUDINARY_* dans .env)" });
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    if (!req.file) {
      return res.status(400).json({ message: "Fichier image requis (champ: image)" });
    }
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "carsbusiness",
      });
      res.json({ url: result.secure_url });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Upload échoué" });
    }
  },
];

module.exports = { uploadImage };
