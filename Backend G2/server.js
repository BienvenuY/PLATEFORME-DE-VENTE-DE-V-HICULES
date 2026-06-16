require("dotenv").config();
const http = require("http");
const express = require("express");
const app = express();
const connectDB = require("./config/db.config");
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const cookieparser = require("cookie-parser");
const initSocket = require("./socket/socketServer");

connectDB();
app.use(cookieparser());
app.use(express.json({ limit: "12mb" }));

const corsOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

const server = http.createServer(app);
const io = initSocket(server, corsOrigins);
app.set("io", io);

app.use("/auth", require("./routes/authRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  res.json({
    ok: true,
    service: "CarsBusiness API",
    realtime: "socket.io",
    mongo:
      mongoState === 1
        ? "connected"
        : mongoState === 2
          ? "connecting"
          : "disconnected",
  });
});

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket sur le port ${PORT}`);
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connecté");
});

mongoose.connection.on("error", (err) => {
  console.error("Erreur MongoDB:", err.message);
});
