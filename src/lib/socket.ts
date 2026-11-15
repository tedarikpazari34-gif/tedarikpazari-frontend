import { io, type Socket } from "socket.io-client";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

const SOCKET_URL = API.replace(/\/api\/?$/, "");

let socket: Socket | null = null;
let connectedToken = "";

export function getSocket(): Socket {
  const token = localStorage.getItem("token") || "";

  if (!socket || connectedToken !== token) {
    socket?.disconnect();

    connectedToken = token;

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: Boolean(token),
      auth: {
        token,
      },
    });
  }

  if (token && !socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  connectedToken = "";
}
