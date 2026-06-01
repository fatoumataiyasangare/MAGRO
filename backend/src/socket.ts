import { Server } from "socket.io";
import { z } from "zod";
import { verifyAccessToken } from "./lib/jwt.js";
import { securityLog } from "./lib/security.js";

const roomSchema = z.string().regex(/^[a-zA-Z0-9:_-]{1,80}$/);
const messageSchema = z.object({
  room: roomSchema,
  content: z.string().trim().min(1).max(2000)
});

export function initRealtime(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string") {
      return next(new Error("Unauthorized"));
    }

    try {
      socket.data.user = verifyAccessToken(token);
      return next();
    } catch {
      securityLog("socket_auth_failed", { socketId: socket.id });
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    securityLog("socket_connected", { socketId: socket.id });

    socket.on("joinRoom", (room) => {
      const parsedRoom = roomSchema.safeParse(room);
      if (parsedRoom.success) {
        socket.join(parsedRoom.data);
      }
    });

    socket.on("sendMessage", (message) => {
      const parsedMessage = messageSchema.safeParse(message);
      if (parsedMessage.success) {
        io.to(parsedMessage.data.room).emit("message", {
          senderId: socket.data.user.userId,
          content: parsedMessage.data.content,
          createdAt: new Date().toISOString()
        });
      }
    });

    socket.on("disconnect", () => {
      securityLog("socket_disconnected", { socketId: socket.id });
    });
  });
}
