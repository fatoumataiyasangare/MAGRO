import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { uuidSchema } from "../lib/security.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

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
  const mappedDisputes = disputes.map(d => ({
    id: d.id,
    orderId: d.orderId,
    openedBy: d.openedBy,
    reason: d.reason,
    status: d.status,
    adminDecision: d.adminDecision,
    splitRatio: d.splitRatio ? Number(d.splitRatio) : undefined,
    decisionNote: d.decisionNote,
    decidedBy: d.decidedBy,
    createdAt: d.createdAt,
    orderPrice: d.order.totalPrice,
    buyerName: d.order.buyer.name,
    cropName: d.order.listing.title
  }));
  res.json(mappedDisputes);
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
  const mappedRequests = requests.map(r => ({
    id: r.id,
    userId: r.userId,
    documents: r.documents,
    status: r.status,
    rejectionReason: r.rejectionReason,
    createdAt: r.createdAt,
    userName: r.user.name,
    userRole: r.user.role
  }));
  res.json(mappedRequests);
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
    where: { 
      status: { notIn: ["CANCELLED", "REJECTED"] }
    }
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

// GET /admin/api-keys
router.get("/api-keys", requireAuth, requireRole("SUPER_ADMIN"), async (_req: AuthRequest, res) => {
  const keys = await prisma.institutionalApiKey.findMany({
    orderBy: { createdAt: "desc" }
  });
  // Ne pas renvoyer le hash !
  res.json(keys.map(k => ({
    id: k.id,
    partnerName: k.partnerName,
    quotaPerDay: k.quotaPerDay,
    isActive: k.isActive,
    createdAt: k.createdAt
  })));
});

// POST /admin/api-keys
router.post("/api-keys", requireAuth, requireRole("SUPER_ADMIN"), async (req: AuthRequest, res) => {
  const schema = z.object({
    partnerName: z.string().min(2),
    quotaPerDay: z.number().int().min(10)
  });
  
  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  
  const rawKey = crypto.randomBytes(24).toString("hex");
  const apiKeyHash = await bcrypt.hash(rawKey, 10);
  
  const newKey = await prisma.institutionalApiKey.create({
    data: {
      partnerName: parseResult.data.partnerName,
      quotaPerDay: parseResult.data.quotaPerDay,
      apiKeyHash,
      createdBy: req.user!.id
    }
  });
  
  res.json({
    id: newKey.id,
    partnerName: newKey.partnerName,
    apiKey: rawKey // La clé brute n'est retournée qu'une seule fois !
  });
});

// DELETE /admin/api-keys/:id
router.delete("/api-keys/:id", requireAuth, requireRole("SUPER_ADMIN"), async (req: AuthRequest, res) => {
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid ID" });
  
  await prisma.institutionalApiKey.delete({
    where: { id: params.data.id }
  });
  
  res.json({ success: true });
});

// GET /admin/export
router.get("/export", requireAuth, requireRole("ANALYST", "SUPER_ADMIN", "MODERATOR"), async (_req: AuthRequest, res) => {
  const data = await prisma.listing.findMany({
    select: {
      title: true,
      price: true,
      region: true,
      createdAt: true
    }
  });
  
  // Basic anonymized export logic per CDC v3
  const exportData = {
    generatedAt: new Date(),
    recordsCount: data.length,
    data: data
  };
  
  res.json(exportData);
});

// PATCH /admin/disputes/:id/status - Update status (e.g., escalate to Mali authority)
router.patch("/disputes/:id/status", requireAuth, requireRole("MODERATOR", "SUPER_ADMIN"), async (req: AuthRequest, res) => {
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid ID" });

  const statusSchema = z.object({
    status: z.enum(["NEW", "IN_REVIEW", "AWAITING_EVIDENCE", "PENDING_REINSPECTION", "RESOLVED"]),
    decisionNote: z.string().trim().optional()
  });

  const parseResult = statusSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: "Invalid payload" });

  const dispute = await prisma.dispute.update({
    where: { id: params.data.id },
    data: {
      status: parseResult.data.status,
      ...(parseResult.data.decisionNote && { decisionNote: parseResult.data.decisionNote })
    }
  });

  res.json(dispute);
});

// GET /admin/users
router.get("/users", requireAuth, requireRole("SUPER_ADMIN"), async (_req: AuthRequest, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      isVerified: true,
      suspensionUntil: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(users);
});

// PATCH /admin/users/:id/suspend
router.patch("/users/:id/suspend", requireAuth, requireRole("SUPER_ADMIN"), async (req: AuthRequest, res) => {
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid ID" });
  
  const bodySchema = z.object({ suspend: z.boolean() });
  const bodyResult = bodySchema.safeParse(req.body);
  if (!bodyResult.success) return res.status(400).json({ error: "Invalid payload" });

  const suspensionUntil = bodyResult.data.suspend ? new Date("9999-12-31T23:59:59Z") : null;

  const user = await prisma.user.update({
    where: { id: params.data.id },
    data: { suspensionUntil }
  });
  
  res.json({ id: user.id, suspensionUntil: user.suspensionUntil });
});

// DELETE /admin/users/:id
router.delete("/users/:id", requireAuth, requireRole("SUPER_ADMIN", "MODERATOR"), async (req: AuthRequest, res) => {
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid ID" });

  const userId = params.data.id;

  // Check for active orders (if orders are in progress, reject deletion)
  const activeOrders = await prisma.order.count({
    where: {
      OR: [{ buyerId: userId }, { listing: { farmerId: userId } }],
      status: { in: ["EN_ATTENTE", "CONFIRMEE", "PRETE", "DISPUTED", "CONFIRMED", "READY", "SHIPPED"] }
    }
  });

  if (activeOrders > 0) {
    return res.status(400).json({ error: "Impossible de supprimer cet utilisateur : il a des commandes en cours. Veuillez attendre la fin des commandes." });
  }

  // Cascading delete using a transaction
  try {
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { senderId: userId } }),
      prisma.conversation.deleteMany({ where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] } }),
      prisma.favorite.deleteMany({ where: { userId } }),
      prisma.order.deleteMany({ where: { buyerId: userId } }),
      prisma.listing.deleteMany({ where: { farmerId: userId } }),
      prisma.dispute.deleteMany({ where: { OR: [{ openedBy: userId }, { assignedTo: userId }, { decidedBy: userId }] } }),
      prisma.seasonalContract.deleteMany({ where: { OR: [{ buyerId: userId }, { farmerId: userId }] } }),
      prisma.verificationRequest.deleteMany({ where: { OR: [{ userId }, { reviewedBy: userId }] } }),
      prisma.refreshToken.deleteMany({ where: { userId } }),
      prisma.trustedPair.deleteMany({ where: { OR: [{ buyerId: userId }, { farmerId: userId }] } }),
      prisma.cooperativeMember.deleteMany({ where: { OR: [{ cooperativeId: userId }, { memberId: userId }] } }),
      prisma.certification.deleteMany({ where: { OR: [{ farmerId: userId }, { expertId: userId }, { financedByBuyerId: userId }] } }),
      prisma.availabilityAlert.deleteMany({ where: { buyerId: userId } }),
      prisma.auditLog.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error("Cascade delete error:", error);
    res.status(500).json({ error: "Erreur lors de la suppression en cascade." });
  }
});

// GET /admin/delete-requests
router.get("/delete-requests", requireAuth, requireRole("SUPER_ADMIN"), async (_req: AuthRequest, res) => {
  const requests = await prisma.accountDeletionRequest.findMany({
    include: {
      user: { select: { id: true, name: true, phone: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(requests);
});

// PATCH /admin/delete-requests/:id/approve
router.patch("/delete-requests/:id/approve", requireAuth, requireRole("SUPER_ADMIN"), async (req: AuthRequest, res) => {
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Invalid ID" });

  const bodySchema = z.object({ status: z.enum(["APPROVED", "REJECTED"]) });
  const bodyResult = bodySchema.safeParse(req.body);
  if (!bodyResult.success) return res.status(400).json({ error: "Invalid payload" });

  const deletionRequest = await prisma.accountDeletionRequest.findUnique({
    where: { id: params.data.id }
  });

  if (!deletionRequest) {
    return res.status(404).json({ error: "Deletion request not found" });
  }

  await prisma.accountDeletionRequest.update({
    where: { id: params.data.id },
    data: { status: bodyResult.data.status }
  });

  if (bodyResult.data.status === "APPROVED") {
    // Check active orders
    const activeOrders = await prisma.order.count({
      where: {
        OR: [{ buyerId: deletionRequest.userId }, { listing: { farmerId: deletionRequest.userId } }],
        status: { in: ["EN_ATTENTE", "CONFIRMEE", "PRETE", "DISPUTED", "CONFIRMED", "READY", "SHIPPED"] }
      }
    });

    if (activeOrders > 0) {
      // Revert status to pending as we can't delete
      await prisma.accountDeletionRequest.update({
        where: { id: params.data.id },
        data: { status: "PENDING" }
      });
      return res.status(400).json({ error: "Impossible de supprimer cet utilisateur : il a des commandes en cours." });
    }

    const userId = deletionRequest.userId;
    try {
      await prisma.$transaction([
        prisma.message.deleteMany({ where: { senderId: userId } }),
        prisma.conversation.deleteMany({ where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] } }),
        prisma.favorite.deleteMany({ where: { userId } }),
        prisma.order.deleteMany({ where: { buyerId: userId } }),
        prisma.listing.deleteMany({ where: { farmerId: userId } }),
        prisma.dispute.deleteMany({ where: { OR: [{ openedBy: userId }, { assignedTo: userId }, { decidedBy: userId }] } }),
        prisma.seasonalContract.deleteMany({ where: { OR: [{ buyerId: userId }, { farmerId: userId }] } }),
        prisma.verificationRequest.deleteMany({ where: { OR: [{ userId }, { reviewedBy: userId }] } }),
        prisma.accountDeletionRequest.deleteMany({ where: { userId } }),
        prisma.refreshToken.deleteMany({ where: { userId } }),
        prisma.trustedPair.deleteMany({ where: { OR: [{ buyerId: userId }, { farmerId: userId }] } }),
        prisma.cooperativeMember.deleteMany({ where: { OR: [{ cooperativeId: userId }, { memberId: userId }] } }),
        prisma.certification.deleteMany({ where: { OR: [{ farmerId: userId }, { expertId: userId }, { financedByBuyerId: userId }] } }),
        prisma.availabilityAlert.deleteMany({ where: { buyerId: userId } }),
        prisma.auditLog.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } })
      ]);
    } catch (error) {
      console.error("Cascade delete error:", error);
      return res.status(500).json({ error: "Erreur lors de la suppression en cascade." });
    }
  }

  res.json({ success: true, status: bodyResult.data.status });
});

export default router;
