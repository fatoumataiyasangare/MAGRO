import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { securityLog } from "../lib/security.js";

const router = Router();

const updateRoleSchema = z.object({ role: z.enum(["BUYER", "FARMER"]) });

function publicUser(user: { id: string; phone: string; name: string; role: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(publicUser(user));
});

router.patch("/role", requireAuth, async (req: AuthRequest, res) => {
  const parseResult = updateRoleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  if (["MODERATOR", "ANALYST", "SUPER_ADMIN"].includes(req.user!.role)) {
    securityLog("blocked_privileged_self_role_change", { userId: req.user!.id });
    return res.status(403).json({ error: "Forbidden" });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { role: parseResult.data.role }
  });

  securityLog("user_role_changed", { userId: user.id, role: user.role });
  res.json(publicUser(user));
});

export default router;
