import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { securityLog } from "../lib/security.js";

const router = Router();

const updateRoleSchema = z.object({
  role: z.enum(["BUYER", "FARMER", "EXPERT", "MODERATOR", "ANALYST"])
});

const updateProfileSchema = z.object({
  region: z.string().trim().max(100).optional(),
  buyerType: z.enum(["INDIVIDUAL", "TRADER", "RESTAURANT", "INSTITUTION", "INDUSTRY"]).optional(),
  isPremium: z.boolean().optional()
});

function publicUser(user: {
  id: string;
  phone: string;
  name: string;
  role: string;
  isVerified: boolean;
  isPremium: boolean;
  region: string;
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
    buyerType: user.buyerType,
    rating: user.rating ? parseFloat(user.rating.toString()) : 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

// GET /profile/me - Frontend fetchProfile() calls this
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(publicUser(user));
});

// GET /profile - Legacy endpoint
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(publicUser(user));
});

// PATCH /profile/role - Change own role (only BUYER <-> FARMER)
router.patch("/role", requireAuth, async (req: AuthRequest, res) => {
  const parseResult = updateRoleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  // Prevent admin-level users from self-modifying critical roles
  if (["MODERATOR", "ANALYST", "SUPER_ADMIN"].includes(req.user!.role)) {
    securityLog("blocked_privileged_self_role_change", { userId: req.user!.id });
    return res.status(403).json({ error: "Forbidden" });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { role: parseResult.data.role }
  });

  securityLog("user_role_changed", { userId: user.id, role: user.role });
  res.json(publicUser(user));
});

// PATCH /profile - Update own profile (region, buyer type, premium)
router.patch("/", requireAuth, async (req: AuthRequest, res) => {
  const parseResult = updateProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parseResult.data
  });

  res.json(publicUser(user));
});

// POST /profile/verify - Submit identity verification request
router.post("/verify", requireAuth, async (req: AuthRequest, res) => {
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
});

export default router;
