import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { z } from "zod";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import {
  clearRefreshCookie,
  getClientIp,
  hashToken,
  phoneSchema,
  securityLog,
  setRefreshCookie
} from "../lib/security.js";
import { sendSMS } from "../lib/sms.js";

const router = Router();

const requestOtpSchema = z.object({ phone: phoneSchema, isSignup: z.boolean().optional() });
const verifyOtpSchema = z.object({ phone: phoneSchema, otp: z.string().regex(/^\d{6}$/) });

function publicUser(user: { id: string; phone: string; name: string; role: string }) {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role
  };
}

router.post("/request-otp", async (req, res) => {
  const parseResult = requestOtpSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { phone, isSignup } = parseResult.data;

  const existingUser = await prisma.user.findUnique({ where: { phone } });

  if (isSignup) {
    if (existingUser) {
      return res.status(400).json({ error: "Un compte existe déjà avec ce numéro. Veuillez vous connecter." });
    }
  } else {
    if (!existingUser) {
      return res.status(404).json({ error: "Vous n'avez pas de compte, inscrivez-vous." });
    }
  }

  await prisma.loginOtp.deleteMany({
    where: {
      phone,
      OR: [
        { expiresAt: { lt: new Date() } },
        { createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) } }
      ]
    }
  });

  const recentOtpCount = await prisma.loginOtp.count({
    where: { phone, createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } }
  });
  if (recentOtpCount >= 3) {
    securityLog("otp_rate_limited", { phone, ip: getClientIp(req) });
    return res.status(429).json({ error: "Too many requests" });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.loginOtp.create({
    data: { phone, codeHash, expiresAt }
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV ONLY] OTP FULL CODE FOR ${phone}: ${code}`);
    securityLog("otp_generated_development", { phone, codePreview: code });
  }

  await sendSMS(phone, `Votre code de vérification MAGRO est : ${code}. Valable 5 minutes.`);

  res.status(200).json({ message: "OTP envoye" });
});

router.post("/verify-otp", async (req, res) => {
  const parseResult = verifyOtpSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { phone, otp } = parseResult.data;
  const otpRecord = await prisma.loginOtp.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    securityLog("otp_verification_failed", { phone, reason: "missing_or_expired", ip: getClientIp(req) });
    return res.status(400).json({ error: "Invalid verification code" });
  }

  const isValid = await bcrypt.compare(otp, otpRecord.codeHash);
  if (!isValid) {
    securityLog("otp_verification_failed", { phone, reason: "invalid_code", ip: getClientIp(req) });
    return res.status(400).json({ error: "Invalid verification code" });
  }

  await prisma.loginOtp.deleteMany({ where: { phone } });

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: {
      phone,
      name: `Utilisateur ${phone.slice(-4)}`,
      passwordHash: await bcrypt.hash(`otp-only:${phone}:${Date.now()}`, 12),
      region: "UNKNOWN"
    }
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role, name: user.name, phone: user.phone });
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      id: refreshToken.tokenId,
      tokenHash: hashToken(refreshToken.token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: user.id,
      userAgent: req.headers["user-agent"],
      ipAddress: getClientIp(req)
    }
  });

  setRefreshCookie(res, refreshToken.token);
  securityLog("login_success", { userId: user.id, ip: getClientIp(req) });

  res.json({ user: publicUser(user), accessToken });
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = verifyRefreshToken(token) as { userId: string; tokenId: string };
    const tokenHash = hashToken(token);
    const refreshRecord = await prisma.refreshToken.findUnique({ where: { id: decoded.tokenId } });

    if (!refreshRecord || refreshRecord.expiresAt < new Date() || refreshRecord.revokedAt) {
      securityLog("refresh_token_reuse_or_expired", { tokenId: decoded.tokenId, userId: decoded.userId, ip: getClientIp(req) });
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.userId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (refreshRecord.tokenHash !== tokenHash) {
      securityLog("refresh_token_hash_mismatch", { tokenId: decoded.tokenId, userId: decoded.userId, ip: getClientIp(req) });
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.userId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const nextRefreshToken = signRefreshToken(user.id);
    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          id: nextRefreshToken.tokenId,
          tokenHash: hashToken(nextRefreshToken.token),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userId: user.id,
          userAgent: req.headers["user-agent"],
          ipAddress: getClientIp(req)
        }
      }),
      prisma.refreshToken.update({
        where: { id: refreshRecord.id },
        data: { revokedAt: new Date(), replacedByTokenId: nextRefreshToken.tokenId }
      })
    ]);

    const accessToken = signAccessToken({ userId: user.id, role: user.role, name: user.name, phone: user.phone });
    setRefreshCookie(res, nextRefreshToken.token);
    return res.json({ accessToken });
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ error: "Unauthorized" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token) as { userId: string; tokenId: string };
      await prisma.refreshToken.updateMany({
        where: { id: decoded.tokenId },
        data: { revokedAt: new Date() }
      });
      securityLog("logout", { userId: decoded.userId, ip: getClientIp(req) });
    } catch {
      securityLog("logout_invalid_token", { ip: getClientIp(req) });
    }
  }

  clearRefreshCookie(res);
  res.status(200).json({ message: "Disconnected" });
});

export default router;
