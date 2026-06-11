import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { uuidSchema } from "../lib/security.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const createContractSchema = z.object({
  farmerId: z.string().uuid(),
  cropName: z.string().trim().min(2).max(100),
  totalQuantityKg: z.number().int().min(1).max(100000000),
  pricePerKg: z.number().int().min(1).max(100000000),
  seasonStart: z.string().datetime(),
  seasonEnd: z.string().datetime(),
  deliverySchedule: z.record(z.unknown())
});

// POST /contracts - Create a seasonal contract (BUYER/INDUSTRY only)
router.post("/", requireAuth, requireRole("BUYER"), asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = createContractSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const { farmerId, cropName, totalQuantityKg, pricePerKg, seasonStart, seasonEnd, deliverySchedule } = parseResult.data;

  const buyer = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!buyer || buyer.buyerType !== "INDUSTRY") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const contract = await prisma.seasonalContract.create({
    data: {
      buyerId: req.user!.id,
      farmerId,
      cropName,
      totalQuantityKg,
      pricePerKg,
      seasonStart: new Date(seasonStart),
      seasonEnd: new Date(seasonEnd),
      deliverySchedule: deliverySchedule as Prisma.InputJsonValue,
      status: "PENDING"
    }
  });

  res.status(201).json(contract);
}));

// GET /contracts/mine - List contracts for the logged-in user (buyer or farmer)
router.get("/mine", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const contracts = await prisma.seasonalContract.findMany({
    where: {
      OR: [
        { buyerId: req.user!.id },
        { farmerId: req.user!.id }
      ]
    },
    include: {
      buyer: { select: { name: true, phone: true } },
      farmer: { select: { name: true, phone: true } }
    }
  });
  res.json(contracts);
}));

// PATCH /contracts/:id/status - Farmer accepts or rejects a contract
router.patch("/:id/status", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
  const statusSchema = z.object({ status: z.enum(["ACTIVE", "CANCELLED"]) });
  const parseResult = statusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const contractId = params.data.id;
  const contract = await prisma.seasonalContract.findUnique({ where: { id: contractId } });
  if (!contract) {
    return res.status(404).json({ error: "Contract not found" });
  }
  if (contract.farmerId !== req.user!.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updatedContract = await prisma.seasonalContract.update({
    where: { id: contractId },
    data: { status: parseResult.data.status }
  });

  res.json(updatedContract);
}));

export default router;
