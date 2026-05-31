import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
const createOrderSchema = z.object({
    listingId: z.string().uuid(),
    quantity: z.number().int().min(1)
});
router.post("/", requireAuth, async (req, res) => {
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
            buyerId: req.user.id,
            quantity,
            totalPrice,
            status: "EN_ATTENTE"
        }
    });
    res.status(201).json(order);
});
router.get("/mine", requireAuth, async (req, res) => {
    const orders = await prisma.order.findMany({
        where: {
            listing: {
                farmerId: req.user.id
            }
        },
        include: {
            listing: true,
            buyer: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    res.json(orders.map((order) => ({
        id: order.id,
        crop: order.listing.title,
        buyer: order.buyer.name,
        quantity: order.quantity,
        status: order.status,
        date: order.createdAt,
        totalPrice: order.totalPrice,
        unit: order.listing.unit
    })));
});
export default router;
