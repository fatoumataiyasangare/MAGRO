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
import adminRoutes from "./routes/admin.js";
import certificationRoutes from "./routes/certifications.js";
import alertRoutes from "./routes/alerts.js";
import contractRoutes from "./routes/contracts.js";
import favoriteRoutes from "./routes/favorites.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireTrustedOrigin } from "./lib/security.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    return res.status(403).json({ error: "HTTPS required" });
  }
  return next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...(process.env.CLIENT_ORIGIN?.split(",") ?? ["http://localhost:5173"])]
    }
  },
  crossOriginResourcePolicy: { policy: "same-site" },
  referrerPolicy: { policy: "no-referrer" }
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(",") ?? ["http://localhost:5173"],
  credentials: true
}));
app.use(requireTrustedOrigin);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/certifications", certificationRoutes);
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/contracts", contractRoutes);
app.use("/api/v1/favorites", favoriteRoutes);

app.use(errorHandler);

export default app;
