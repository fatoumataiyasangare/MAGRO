import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { uuidSchema } from "../lib/security.js";

const router = Router();

const createListingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  price: z.number().int().min(1).max(100000000),
  quantity: z.number().int().min(1).max(1000000),
  region: z.string().trim().min(2).max(80),
  image: z.string().url().optional()
});
const listingIdSchema = z.object({ id: uuidSchema });

router.get("/", async (_req, res) => {
  const listings = await prisma.listing.findMany({
    include: { farmer: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" }
  });

  res.json(listings);
});

router.get("/mine", requireAuth, requireRole("FARMER"), async (req: AuthRequest, res) => {
  const listings = await prisma.listing.findMany({
    where: { farmerId: req.user!.id },
    orderBy: { createdAt: "desc" }
  });
  res.json(listings);
});

router.post("/", requireAuth, requireRole("FARMER"), async (req: AuthRequest, res) => {
  const parseResult = createListingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const data = parseResult.data;
  const listing = await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description ?? "",
      price: data.price,
      quantity: data.quantity,
      region: data.region,
      image: data.image ?? "https://images.unsplash.com/photo-1772984613890-e3bfbca7f245?w=400",
      farmerId: req.user!.id
    }
  });

  res.status(201).json(listing);
});

router.delete("/:id", requireAuth, requireRole("FARMER"), async (req: AuthRequest, res) => {
  const params = listingIdSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.data.id } });
  if (!listing) {
    return res.status(404).json({ error: "Not found" });
  }
  if (listing.farmerId !== req.user!.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await prisma.listing.delete({ where: { id: params.data.id } });
  res.status(200).json({ message: "Deleted" });
});

export default router;
