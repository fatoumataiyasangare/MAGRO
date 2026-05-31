import { Server } from "socket.io";

export function initRealtime(io: Server) {
  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("joinRoom", (room) => {
      socket.join(room);
    });

    socket.on("sendMessage", (message) => {
      if (message.room) {
        io.to(message.room).emit("message", message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });
}
