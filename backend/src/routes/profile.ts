import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { securityLog } from "../lib/security.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const updateRoleSchema = z.object({
  role: z.enum(["BUYER", "FARMER"])
});

const updateProfileSchema = z.object({
  name: z.string().trim().max(100).optional(),
  region: z.string().trim().max(100).optional(),
  buyerType: z.enum(["INDIVIDUAL", "TRADER", "RESTAURANT", "INSTITUTION", "INDUSTRY"]).optional(),
  email: z.string().email().or(z.string().length(0)).nullable().optional(),
  avatarUrl: z.string().url().or(z.string().length(0)).nullable().optional()
});

function publicUser(user: {
  id: string;
  phone: string;
  name: string;
  role: string;
  isVerified: boolean;
  isPremium: boolean;
  region: string;
  email?: string | null;
  avatarUrl?: string | null;
  buyerType?: string | null;
  rating?: any;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    isPremium: user.isPremium,
    region: user.region,
    email: user.email,
    avatarUrl: user.avatarUrl,
    buyerType: user.buyerType,
    rating: user.rating ? parseFloat(user.rating.toString()) : 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

// GET /profile/me - Frontend fetchProfile() calls this
router.get("/me", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(publicUser(user));
}));

// GET /profile - Legacy endpoint
router.get("/", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(publicUser(user));
}));

// PATCH /profile/role - Change own role (only BUYER <-> FARMER)
router.patch("/role", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = updateRoleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  // Prevent admin-level users from self-modifying their roles
  if (req.user!.role !== "BUYER" && req.user!.role !== "FARMER") {
    securityLog("blocked_privileged_self_role_change", { userId: req.user!.id });
    return res.status(403).json({ error: "Forbidden" });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { role: parseResult.data.role }
  });

  securityLog("user_role_changed", { userId: user.id, role: user.role });
  res.json(publicUser(user));
}));

// PATCH /profile - Update own profile (region, buyer type, premium)
router.patch("/", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = updateProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...parseResult.data,
      ...(parseResult.data.name && { name: parseResult.data.name })
    }
  });

  res.json(publicUser(user));
}));

// POST /profile/verify - Submit identity verification request
router.post("/verify", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const docSchema = z.object({
    identityCardUrl: z.string().min(3),
    parcelPhotoUrl: z.string().optional(),
    gpsCoordinates: z.string().optional(),
    tradeRegistryUrl: z.string().optional()
  });

  const parseResult = docSchema.safeParse(req.body.documents);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const existing = await prisma.verificationRequest.findFirst({
    where: { userId: req.user!.id, status: "PENDING" }
  });

  if (existing) {
    return res.status(409).json({ error: "A pending verification request already exists" });
  }

  const request = await prisma.verificationRequest.create({
    data: {
      userId: req.user!.id,
      documents: parseResult.data,
      status: "PENDING"
    }
  });

  res.status(201).json(request);
}));

// POST /profile/delete-request - Request account deletion
router.post("/delete-request", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const schema = z.object({ reason: z.string().optional() });
  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const existing = await prisma.accountDeletionRequest.findFirst({
    where: { userId: req.user!.id, status: "PENDING" }
  });

  if (existing) {
    return res.status(409).json({ error: "Une demande de suppression est déjà en attente." });
  }

  const request = await prisma.accountDeletionRequest.create({
    data: {
      userId: req.user!.id,
      reason: parseResult.data.reason
    }
  });

  res.status(201).json(request);
}));

export default router;
