import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.get("/contacts", requireAuth, async (req, res) => {
    res.json([
        { id: "support", name: "Assistant MAGRO", lastMessage: "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?" },
        { id: "seller-1", name: "Ali Fermier", lastMessage: "Bonjour, j'ai encore des tomates disponibles." }
    ]);
});
router.get("/messages/:contactId", requireAuth, async (req, res) => {
    const contactId = req.params.contactId;
    const messages = contactId === "support"
        ? [
            { id: "m1", sender: "support", content: "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?", createdAt: new Date().toISOString() }
        ]
        : [
            { id: "m2", sender: "farmer", content: "Bonjour, nous avons du stock disponible.", createdAt: new Date().toISOString() },
            { id: "m3", sender: "buyer", content: "Je suis intéressé, quel est le prix ?", createdAt: new Date().toISOString() }
        ];
    res.json(messages);
});
export default router;
