import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { uuidSchema } from "../lib/security.js";

const router = Router();

const favoriteSchema = z.object({
  listingId: uuidSchema
});

// GET / - List all favorites of current user
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: {
        listing: {
          include: {
            farmer: {
              select: { id: true, name: true, role: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(favorites.map(f => f.listing));
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST / - Add favorite
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parseResult = favoriteSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid listingId" });
  }

  const { listingId } = parseResult.data;

  try {
    // Check if listing exists
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_listingId: {
          userId: req.user!.id,
          listingId
        }
      },
      update: {},
      create: {
        userId: req.user!.id,
        listingId
      }
    });

    res.status(201).json(favorite);
  } catch (err) {
    console.error("Error creating favorite:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:listingId - Remove favorite
router.delete("/:listingId", requireAuth, async (req: AuthRequest, res) => {
  const paramsSchema = z.object({ listingId: uuidSchema });
  const params = paramsSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Invalid listingId" });
  }

  const { listingId } = params.data;

  try {
    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: req.user!.id,
          listingId
        }
      }
    });
    res.json({ message: "Favorite removed" });
  } catch (err) {
    // If not found or error, return success as the outcome is the same (it is no longer favorited)
    res.json({ message: "Favorite removed" });
  }
});

export default router;
