import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import orderRoutes from "./routes/orders.js";
import profileRoutes from "./routes/profile.js";
import chatRoutes from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? ["http://localhost:5173"],
    credentials: true
}));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
}));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use(errorHandler);
export default app;
