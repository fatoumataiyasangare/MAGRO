import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();
const contactParamsSchema = z.object({ contactId: z.enum(["support", "seller-1"]) });

router.get("/contacts", requireAuth, async (_req: AuthRequest, res) => {
  res.json([
    { id: "support", name: "Assistant MAGRO", lastMessage: "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?" },
    { id: "seller-1", name: "Ali Fermier", lastMessage: "Bonjour, j'ai encore des tomates disponibles." }
  ]);
});

router.get("/messages/:contactId", requireAuth, async (req: AuthRequest, res) => {
  const params = contactParamsSchema.safeParse(req.params);
  if (!params.success) {
    return res.status(404).json({ error: "Not found" });
  }

  const messages = params.data.contactId === "support"
    ? [
        { id: "m1", sender: "support", content: "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?", createdAt: new Date().toISOString() }
      ]
    : [
        { id: "m2", sender: "farmer", content: "Bonjour, nous avons du stock disponible.", createdAt: new Date().toISOString() },
        { id: "m3", sender: "buyer", content: "Je suis interesse, quel est le prix ?", createdAt: new Date().toISOString() }
      ];

  res.json(messages);
});

export default router;
