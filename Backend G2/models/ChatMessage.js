const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

chatMessageSchema.index({ car: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
