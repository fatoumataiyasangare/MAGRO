import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

const createOrderSchema = z.object({
  listingId: z.string().uuid(),
  quantity: z.number().int().min(1)
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parseResult = createOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const { listingId, quantity } = parseResult.data;
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return res.status(404).json({ error: "Annonce introuvable" });
  }

  const totalPrice = listing.price * quantity;

  const order = await prisma.order.create({
    data: {
      listingId,
      buyerId: req.user!.id,
      quantity,
      totalPrice,
      status: "EN_ATTENTE"
    }
  });

  res.status(201).json(order);
});

export default router;
