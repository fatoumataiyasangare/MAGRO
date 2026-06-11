import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { uuidSchema } from "../lib/security.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const requestCertSchema = z.object({
  cropName: z.string().trim().min(2).max(100),
  listingId: z.string().uuid().optional()
});

const submitScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  criteriaDetail: z.object({
    aspect: z.number().min(0).max(30),
    brix: z.number().min(0).max(25),
    hygiene: z.number().min(0).max(20),
    practices: z.number().min(0).max(15),
    traceability: z.number().min(0).max(10)
  })
});

// GET /
router.get("/", requireAuth, asyncHandler(async (req: AuthRequest, res) => {
  const whereClause = ["EXPERT", "MODERATOR", "SUPER_ADMIN", "ANALYST"].includes(req.user!.role)
    ? {} 
    : { farmerId: req.user!.id };

  const certs = await prisma.certification.findMany({
    where: whereClause,
    include: { farmer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });
  
  res.json(certs);
}));

// POST /certifications/request
router.post("/request", requireAuth, requireRole("FARMER"), asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = requestCertSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const { cropName, listingId } = parseResult.data;

  // Créer un dossier de demande (simulé ou enregistré en tant que requête en base)
  // Dans le modèle actuel, nous créons un enregistrement de certification "SUSPENDED" ou "EXPIRED" qui sert de demande en attente
  const request = await prisma.certification.create({
    data: {
      farmerId: req.user!.id,
      expertId: req.user!.id, // Sera réassigné à un expert réel plus tard
      cropName,
      score: 0,
      badgeLevel: "SILVER", // par défaut
      criteriaDetail: {},
      reportUrl: "",
      validFrom: new Date(),
      validTo: new Date(),
      status: "SUSPENDED" // Statut en attente d'évaluation
    }
  });

  res.status(201).json(request);
}));

// POST /certifications/:id/score
router.post("/:id/score", requireAuth, requireRole("EXPERT", "MODERATOR", "SUPER_ADMIN"), asyncHandler(async (req: AuthRequest, res) => {
  const parseResult = submitScoreSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }
  const params = z.object({ id: uuidSchema }).safeParse(req.params);
  if (!params.success) {
    return res.status(400).json({ error: "Payload invalid" });
  }

  const certId = params.data.id;
  const cert = await prisma.certification.findUnique({ where: { id: certId } });
  if (!cert) {
    return res.status(404).json({ error: "Certification not found" });
  }

  const { score, criteriaDetail } = parseResult.data;
  const badgeLevel = score >= 80 ? "GOLD" : "SILVER";

  const updatedCert = await prisma.certification.update({
    where: { id: certId },
    data: {
      score,
      badgeLevel,
      criteriaDetail,
      expertId: req.user!.id,
      status: "ACTIVE",
      validFrom: new Date(),
      validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Valide 6 mois (une saison)
      reportUrl: `https://magro.ml/reports/cert-${certId}.pdf`
    }
  });

  res.json(updatedCert);
}));

export default router;
