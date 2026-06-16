const Notification = require("../models/Notification");

const listMine = async (req, res) => {
  const items = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(items);
};

const markRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { $set: { read: true } }
  );
  res.json({ ok: true });
};

module.exports = { listMine, markRead };
