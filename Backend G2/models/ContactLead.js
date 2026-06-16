const mongoose = require("mongoose");

const contactLeadSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactLead", contactLeadSchema);
