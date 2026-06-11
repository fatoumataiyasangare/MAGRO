import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { uuidSchema } from "../lib/security.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const createOrderSchema = z.object({
  listingId: z.string().uuid(),
  quantity: z.number().int().min(1).max(1000000),
  depositRequired: z.boolean().optional().default(false),
  depositAmount: z.number().int().min(0).optional().default(0),
  riskScore: z.number().int().min(0).max(100).optional().default(0)
});

const updateStatusSchema = z.object({
  status: z.enum([
    "EN_ATTENTE",
    "CONFIRMEE",
    "CONFIRMED",
    "IN_PRODUCTION",
    "PRETE",
    "READY",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "DISPUTED"
  ])
});

const openDisputeSchema = z.object({
  reason: z.string().trim().min(10).max(2000)
});
const orderIdSchema = z.object({ id: uuidSchema });

// POST /orders - Create a new order (BUYER only)
router.post("/", requireAuth, requireRole("BUYER"), asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = createOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const { listingId, quantity, depositRequired, depositAmount, riskScore } = parseResult.data;
  const order = await prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.quantity < quantity || listing.farmerId === req.user!.id) {
      return null;
    }

    await tx.listing.update({
      where: { id: listingId },
      data: { quantity: { decrement: quantity } }
    });

    return tx.order.create({
      data: {
        listingId,
        buyerId: req.user!.id,
        quantity,
        totalPrice: listing.price * quantity,
        status: "EN_ATTENTE",
        depositRequired: depositRequired ?? false,
        depositAmount: depositAmount ?? 0,
        riskScore: riskScore ?? 0,
        paymentStatus: (depositRequired && depositAmount && depositAmount > 0) ? "DEPOSIT_PAID" : "ESCROW"
      }
    });
  });

  if (!order) {
    return res.status(400).json({ error: "Request cannot be processed" });
  }

  res.status(201).json(order);
}));

// GET /orders/mine - List orders for logged-in farmer
router.get("/mine", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: {
      listing: {
        farmerId: req.user!.id
      }
    },
    include: {
      listing: true,
      buyer: { select: { id: true, name: true } }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json(
    orders.map((order) => ({
      id: order.id,
      listingId: order.listingId,
      crop: order.listing.title,
      buyer: order.buyer.name,
      quantity: order.quantity,
      status: order.status,
      date: order.createdAt,
      totalPrice: order.totalPrice,
      unit: order.listing.unit,
      depositRequired: order.depositRequired,
      depositAmount: order.depositAmount,
      riskScore: order.riskScore,
      paymentStatus: order.paymentStatus
    }))
  );
}));

// PATCH /orders/:id/status - Farmer updates order status
router.patch("/:id/status", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = updateStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }
  const params = orderIdSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.data.id },
    include: { listing: true }
  });

  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.listing.farmerId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.order.update({
    where: { id: params.data.id },
    data: { status: parseResult.data.status }
  });

  res.json(updated);
}));

// POST /orders/:id/confirm-delivery - Buyer confirms receipt (releases escrow)
router.post("/:id/confirm-delivery", requireAuth, requireRole("BUYER"), asyncHandler(async (req: AuthRequest, res) => {
  const params = orderIdSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const order = await prisma.order.findUnique({ where: { id: params.data.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.buyerId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.order.update({
    where: { id: params.data.id },
    data: {
      status: "DELIVERED",
      paymentStatus: "RELEASED",
      deliveredAt: new Date()
    }
  });

  res.json(updated);
}));

// POST /orders/:id/dispute - Buyer opens a dispute
router.post("/:id/dispute", requireAuth, requireRole("BUYER"), asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = openDisputeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }
  const params = orderIdSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const order = await prisma.order.findUnique({ where: { id: params.data.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.buyerId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

  const [updatedOrder, dispute] = await prisma.$transaction([
    prisma.order.update({
      where: { id: params.data.id },
      data: { status: "DISPUTED" }
    }),
    prisma.dispute.create({
      data: {
        orderId: order.id,
        openedBy: req.user!.id,
        reason: parseResult.data.reason,
        status: "NEW"
      }
    })
  ]);

  res.status(201).json({ order: updatedOrder, dispute });
}));

// GET /orders/buyer - List all orders of the logged-in buyer
router.get("/buyer", requireAuth, requireRole("BUYER"), asyncHandler(async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.id },
    include: {
      listing: {
        include: {
          farmer: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(
    orders.map((order) => ({
      id: order.id,
      crop: order.listing.title,
      farmer: order.listing.farmer.name,
      quantity: order.quantity,
      status: order.status,
      date: order.createdAt,
      totalPrice: order.totalPrice,
      unit: order.listing.unit,
      depositRequired: order.depositRequired,
      depositAmount: order.depositAmount,
      riskScore: order.riskScore,
      paymentStatus: order.paymentStatus
    }))
  );
}));

// POST /orders/:id/cancel - Cancel order and restore stock
router.post("/:id/cancel", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const params = orderIdSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.data.id },
    include: { listing: true }
  });

  if (!order) return res.status(404).json({ error: "Order not found" });

  // Only the buyer or the farmer can cancel
  if (order.buyerId !== req.user!.id && order.listing.farmerId !== req.user!.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: order.listingId },
      data: { quantity: { increment: order.quantity } }
    });

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED"
      }
    });
  });

  res.json(updated);
}));

export default router;
