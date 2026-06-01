import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";

const router = Router();

const createAlertSchema = z.object({
  cropName: z.string().trim().min(2).max(100),
  region: z.string().trim().max(100).optional()
});

router.post("/", requireAuth, requireRole("BUYER"), async (req: AuthRequest, res) => {
  const parseResult = createAlertSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const { cropName, region } = parseResult.data;

  const alert = await prisma.availabilityAlert.create({
    data: {
      buyerId: req.user!.id,
      cropName,
      region: region ?? null
    }
  });

  res.status(201).json(alert);
});

router.get("/mine", requireAuth, requireRole("BUYER"), async (req: AuthRequest, res) => {
  const alerts = await prisma.availabilityAlert.findMany({
    where: { buyerId: req.user!.id }
  });
  res.json(alerts);
});

export default router;
