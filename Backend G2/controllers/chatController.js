const ChatMessage = require("../models/ChatMessage");

const listMessages = async (req, res) => {
  const messages = await ChatMessage.find({ car: req.params.carId })
    .populate("user", "first_name last_name")
    .sort({ createdAt: 1 })
    .limit(200);
  res.json(messages);
};

const postMessage = async (req, res) => {
  const msg = await ChatMessage.create({
    car: req.params.carId,
    user: req.user.id,
    text: req.body.text,
  });
  const populated = await ChatMessage.findById(msg._id).populate(
    "user",
    "first_name last_name"
  );
  const io = req.app.get("io");
  if (io) {
    io.to(`car:${req.params.carId}`).emit("chat:message", populated.toObject());
  }
  res.status(201).json(populated);
};

module.exports = { listMessages, postMessage };
