import { Request, Response, NextFunction } from "express";
import { getClientIp, sanitizeForLog } from "../lib/security.js";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  console.error(JSON.stringify({
    level: "error",
    type: "application",
    at: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: getClientIp(req),
    error: err instanceof Error ? { name: err.name, message: err.message } : sanitizeForLog(err)
  }));

  // Detect Prisma/database connection errors and return user-friendly message
  if (err instanceof Error) {
    const msg = err.message || "";
    if (msg.includes("Can't reach database server") || msg.includes("Connection refused") || msg.includes("ECONNREFUSED") || err.name === "PrismaClientKnownRequestError") {
      return res.status(503).json({ error: "Service temporairement indisponible. Réessayez dans quelques instants." });
    }
  }

  res.status(500).json({ error: "Internal server error" });
}
