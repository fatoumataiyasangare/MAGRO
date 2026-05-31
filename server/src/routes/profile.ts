import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

const updateRoleSchema = z.object({ role: z.enum(["BUYER", "FARMER", "REGULATOR"]) });

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable" });
  }
  res.json(user);
});

router.patch("/role", requireAuth, async (req: AuthRequest, res) => {
  const parseResult = updateRoleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { role: parseResult.data.role }
  });

  res.json(user);
});

export default router;
