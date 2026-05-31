import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

const createListingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().min(1),
  quantity: z.number().int().min(1),
  region: z.string().min(1),
  image: z.string().url().optional()
});

router.get("/", async (req, res) => {
  const listings = await prisma.listing.findMany({
    include: { farmer: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(listings);
});

router.get("/mine", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const listings = await prisma.listing.findMany({
    where: { farmerId: userId },
    orderBy: { createdAt: "desc" }
  });
  res.json(listings);
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
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

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) {
    return res.status(404).json({ error: "Annonce introuvable" });
  }
  if (listing.farmerId !== req.user!.id) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  await prisma.listing.delete({ where: { id: req.params.id } });
  res.status(200).json({ message: "Annonce supprimée" });
});

export default router;
