import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const weakSecretValues = new Set([
  "change_this_secret",
  "replace-with-a-secure-random-value",
  "magro-production-secret-key-change-in-production",
  "magro-dev-secret-key-change-in-production-12345"
]);

export const phoneSchema = z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number");
export const uuidSchema = z.string().uuid();

export function getRequiredSecret(name: string): string {
  const value = process.env[name];
  const isProduction = process.env.NODE_ENV === "production";

  if (!value || weakSecretValues.has(value) || value.length < 32) {
    if (isProduction) {
      throw new Error(`${name} must be a strong random secret of at least 32 characters`);
    }
    return crypto.randomBytes(48).toString("hex");
  }

  return value;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function timingSafeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() || req.ip || "unknown";
  }
  return req.ip || "unknown";
}

export function sanitizeForLog(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  const sensitiveKeys = new Set(["password", "token", "accessToken", "refreshToken", "otp", "secret", "apiKey"]);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      sensitiveKeys.has(key) ? "[REDACTED]" : entry
    ])
  );
}

export function securityLog(event: string, metadata: Record<string, unknown> = {}) {
  const safeMetadata = sanitizeForLog(metadata) as Record<string, unknown>;
  console.info(JSON.stringify({
    level: "info",
    type: "security",
    event,
    at: new Date().toISOString(),
    ...safeMetadata
  }));
}

export function requireTrustedOrigin(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    securityLog("blocked_untrusted_origin", { origin, path: req.path, ip: getClientIp(req) });
    return res.status(403).json({ error: "Forbidden" });
  }

  return next();
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearRefreshCookie(res: Response) {
  // Clear the new path
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  // Clear the old path to prevent zombie cookies
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth"
  });
}
