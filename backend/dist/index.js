import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { Server as SocketIOServer } from "socket.io";
import { initRealtime } from "./socket.js";
dotenv.config();
const port = Number(process.env.PORT ?? 4000);
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN?.split(",") ?? ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
initRealtime(io);
server.listen(port, () => {
    console.log(`MAGRO backend listening on http://localhost:${port}`);
});
