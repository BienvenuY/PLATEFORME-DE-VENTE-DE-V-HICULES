import { io } from "socket.io-client";
import { apiBaseURL } from "./api";

/**
 * Connexion WebSocket authentifiée (JWT dans auth.token).
 * Pensez à appeler socket.disconnect() au démontage du composant.
 */
export function createAuthenticatedSocket(accessToken) {
  return io(apiBaseURL, {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
}
