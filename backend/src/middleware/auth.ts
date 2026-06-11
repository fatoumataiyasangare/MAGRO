import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { securityLog } from "../lib/security.js";

export interface AuthRequest extends Request {
  user?: { id: string; role: "BUYER" | "FARMER" | "REGULATOR" | "COOPERATIVE" | "EXPERT" | "MODERATOR" | "ANALYST" | "SUPER_ADMIN"; name: string; phone: string };
}

import prisma from "../lib/prisma.js";

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token) as {
      userId: string;
      role: "BUYER" | "FARMER" | "REGULATOR" | "COOPERATIVE" | "EXPERT" | "MODERATOR" | "ANALYST" | "SUPER_ADMIN";
      name: string;
      phone: string;
    };
    
    // Check if user is suspended
    const user = await prisma.user.findUnique({ 
      where: { id: payload.userId }, 
      select: { suspensionUntil: true } 
    });

    if (!user || (user.suspensionUntil && new Date() < user.suspensionUntil)) {
      return res.status(403).json({ error: "Votre compte a été suspendu par un administrateur." });
    }

    req.user = {
      id: payload.userId,
      role: payload.role,
      name: payload.name,
      phone: payload.phone
    };
    next();
  } catch (error) {
    securityLog("invalid_access_token", { path: req.path });
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export function requireRole(...roles: Array<"BUYER" | "FARMER" | "REGULATOR" | "COOPERATIVE" | "EXPERT" | "MODERATOR" | "ANALYST" | "SUPER_ADMIN">) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as any)) {
      securityLog("forbidden_role", { path: req.path, userId: req.user?.id, role: req.user?.role });
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  };
}
