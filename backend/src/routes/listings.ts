import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { uuidSchema } from "../lib/security.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const createListingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  price: z.number().int().min(1).max(100000000),
  quantity: z.number().int().min(1).max(1000000),
  region: z.string().trim().min(2).max(80),
  image: z.string().optional(),
  videoUrl: z.string().optional()
});
const listingIdSchema = z.object({ id: uuidSchema });

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;
  
  const listings = await prisma.listing.findMany({
    include: { 
      farmer: { 
        select: { 
          id: true, 
          name: true, 
          phone: true,
          role: true,
          rating: true,
          avatarUrl: true,
          isVerified: true,
          isPremium: true
        } 
      } 
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset
  });

  res.json(listings);
}));

router.get("/mine", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
  const listings = await prisma.listing.findMany({
    where: { farmerId: req.user!.id },
    orderBy: { createdAt: "desc" }
  });
  res.json(listings);
}));

router.post("/", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
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
      image: data.image ?? "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Farmer_in_rice_paddy.jpg/800px-Farmer_in_rice_paddy.jpg",
      videoUrl: data.videoUrl ?? null,
      farmerId: req.user!.id
    }
  });

  res.status(201).json(listing);
}));

router.delete("/:id", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
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

  const activeOrders = await prisma.order.count({
    where: { listingId: params.data.id }
  });

  if (activeOrders > 0) {
    // If there are orders, we can't delete it directly. 
    // We can just set the quantity to 0 so it no longer shows up as available.
    await prisma.listing.update({
      where: { id: params.data.id },
      data: { quantity: 0, quantityRemaining: 0 }
    });
    return res.status(200).json({ message: "Annonce désactivée car elle a des commandes liées." });
  }

  // Delete favorites first to avoid foreign key constraint errors
  await prisma.favorite.deleteMany({
    where: { listingId: params.data.id }
  });

  await prisma.listing.delete({ where: { id: params.data.id } });
  res.status(200).json({ message: "Deleted" });
}));

const updateListingSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  price: z.number().int().min(1).max(100000000).optional(),
  quantity: z.number().int().min(1).max(1000000).optional(),
  region: z.string().trim().min(2).max(80).optional(),
  image: z.string().optional()
});

router.patch("/:id", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
  const params = listingIdSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Id invalid" });
  }

  const parseResult = updateListingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.data.id } });
  if (!listing) {
    return res.status(404).json({ error: "Not found" });
  }
  if (listing.farmerId !== req.user!.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const data = parseResult.data;
  const updatedListing = await prisma.listing.update({
    where: { id: params.data.id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price && { price: data.price }),
      ...(data.quantity && { quantity: data.quantity }),
      ...(data.region && { region: data.region }),
      ...(data.image && { image: data.image })
    }
  });

  res.json(updatedListing);
}));

const updateStockSchema = z.object({
  quantity: z.number().int().min(0).max(1000000)
});

router.patch("/:id/stock", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
  const params = listingIdSchema.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: "Id invalid" });
  
  const parseResult = updateStockSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: "Payload invalid" });
  
  const listing = await prisma.listing.findUnique({ where: { id: params.data.id } });
  if (!listing) return res.status(404).json({ error: "Not found" });
  if (listing.farmerId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });
  
  const updatedListing = await prisma.listing.update({
    where: { id: params.data.id },
    data: { quantity: parseResult.data.quantity }
  });
  
  res.json(updatedListing);
}));

export default router;
