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

  res.status(500).json({ error: "Internal server error" });
}
