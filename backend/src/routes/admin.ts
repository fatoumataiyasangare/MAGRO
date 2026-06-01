import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { uuidSchema } from "../lib/security.js";

const router = Router();

const resolveDisputeSchema = z.object({
  decision: z.enum(["FARMER_WINS", "BUYER_WINS", "SPLIT", "REINSPECTION", "PARTIAL_REFUND"]),
  splitRatio: z.number().min(0).max(1).optional(),
  decisionNote: z.string().trim().min(5).max(2000)
});

const verifyRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().trim().max(1000).optional()
});

// GET /admin/disputes
router.get("/disputes", requireAuth, requireRole("MODERATOR", "SUPER_ADMIN"), async (_req: AuthRequest, res) => {
  const disputes = await prisma.dispute.findMany({
    include: {
      order: {
        include: {
          buyer: { select: { id: true, name: true, phone: true } },
          listing: { select: { id: true, title: true, price: true } }
        }
      },
      openedByUser: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(disputes);
});

// PATCH /admin/disputes/:id/resolve
router.patch("/disputes/:id/resolve", requireAuth, requireRole("MODERATOR", "SUPER_ADMIN"), async (req: AuthRequest, res) => {
  const parseResult = resolveDisputeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const disputeId = params.data.id;
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { order: true }
  });

  if (!dispute) {
    return res.status(404).json({ error: "Dispute not found" });
  }

  // CDC Rule: Plafond de modération (1 000 000 FCFA)
  if (dispute.order.totalPrice > 1000000 && req.user!.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { decision, splitRatio, decisionNote } = parseResult.data;

  const updatedDispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "RESOLVED",
      adminDecision: decision,
      splitRatio: splitRatio ? parseFloat(splitRatio.toString()) : null,
      decisionNote,
      decidedBy: req.user!.id,
      resolvedAt: new Date()
    }
  });

  // Mettre à jour l'ordre également
  await prisma.order.update({
    where: { id: dispute.orderId },
    data: {
      status: "RESOLVED",
      paymentStatus: decision === "BUYER_WINS" ? "REFUNDED" : decision === "FARMER_WINS" ? "RELEASED" : "PARTIAL_REFUND"
    }
  });

  res.json(updatedDispute);
});

// GET /admin/verifications
router.get("/verifications", requireAuth, requireRole("MODERATOR", "SUPER_ADMIN"), async (_req: AuthRequest, res) => {
  const requests = await prisma.verificationRequest.findMany({
    include: {
      user: { select: { id: true, name: true, phone: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(requests);
});

// PATCH /admin/verifications/:id
router.patch("/verifications/:id", requireAuth, requireRole("MODERATOR", "SUPER_ADMIN"), async (req: AuthRequest, res) => {
  const parseResult = verifyRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const requestId = params.data.id;
  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    return res.status(404).json({ error: "Verification request not found" });
  }

  const { status, rejectionReason } = parseResult.data;

  if (status === "REJECTED" && !rejectionReason) {
    return res.status(400).json({ error: "Rejection reason is required" });
  }

  const updatedRequest = await prisma.verificationRequest.update({
    where: { id: requestId },
    data: {
      status,
      rejectionReason: status === "REJECTED" ? rejectionReason : null,
      reviewedBy: req.user!.id,
      reviewedAt: new Date()
    }
  });

  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: request.userId },
      data: { isVerified: true }
    });
  }

  res.json(updatedRequest);
});

// GET /admin/stats
router.get("/stats", requireAuth, requireRole("ANALYST", "MODERATOR", "SUPER_ADMIN"), async (_req: AuthRequest, res) => {
  const totalVolume = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: { status: "DELIVERED" }
  });

  const ordersCount = await prisma.order.groupBy({
    by: ["status"],
    _count: true
  });

  const usersCount = await prisma.user.groupBy({
    by: ["role"],
    _count: true
  });

  res.json({
    totalVolumeFCFA: totalVolume._sum.totalPrice ?? 0,
    ordersByStatus: ordersCount,
    usersByRole: usersCount
  });
});

export default router;
