import { io, type Socket } from "socket.io-client";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

const SOCKET_URL = API.replace(/\/api\/?$/, "");

let socket: Socket | null = null;
let connectedUserId = "";

export function getSocket(): Socket {
  const userId = localStorage.getItem("userId") || "";

  if (!socket || connectedUserId !== userId) {
    socket?.disconnect();

    connectedUserId = userId;

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: Boolean(userId),
      query: {
        userId,
      },
    });
  }

  if (userId && !socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  connectedUserId = "";
}
