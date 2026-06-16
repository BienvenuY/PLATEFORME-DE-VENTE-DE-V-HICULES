const ContactLead = require("../models/ContactLead");

const createLead = async (req, res) => {
  try {
    const lead = await ContactLead.create(req.body);
    res.status(201).json(lead);
  } catch (e) {
    res.status(400).json({ message: "Formulaire invalide" });
  }
};

module.exports = { createLead };
