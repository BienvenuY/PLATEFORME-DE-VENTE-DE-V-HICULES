const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

/**
 * Chat temps réel par salle `car:<mongoId>`.
 * Auth : token JWT dans `handshake.auth.token`.
 */
function initSocket(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err || !decoded?.userInfo?.id) {
        return next(new Error("Unauthorized"));
      }
      socket.userId = String(decoded.userInfo.id);
      next();
    });
  });

  io.on("connection", (socket) => {
    socket.on("join:car", (carId) => {
      if (!/^[a-f0-9]{24}$/i.test(String(carId || ""))) return;
      socket.join(`car:${carId}`);
    });
    socket.on("leave:car", (carId) => {
      if (!carId) return;
      socket.leave(`car:${carId}`);
    });
  });

  return io;
}

module.exports = initSocket;
