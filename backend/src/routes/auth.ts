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
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const requestOtpSchema = z.object({ phone: phoneSchema, isSignup: z.boolean().optional() });
const verifyOtpSchema = z.object({ 
  phone: phoneSchema, 
  otp: z.string().regex(/^\d{6}$/),
  name: z.string().optional(),
  role: z.enum(["FARMER", "BUYER"]).optional()
});

function publicUser(user: { id: string; phone: string; name: string; role: string; email?: string | null; avatarUrl?: string | null }) {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
    email: user.email,
    avatarUrl: user.avatarUrl
  };
}

router.post("/request-otp", asyncHandler(async (req, res) => {
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
      return res.status(404).json({ error: "Aucun compte trouvé avec ce numéro. Veuillez vous inscrire." });
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

  const code = (phone.startsWith("+2237000000") || phone.startsWith("+2239000000") || phone === "+22399999999") ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.loginOtp.create({
    data: { phone, codeHash, expiresAt }
  });

  if (process.env.NODE_ENV !== "production" || phone.startsWith("+2237000000")) {
    console.log(`[DEV/TEST] OTP FULL CODE FOR ${phone}: ${code}`);
    securityLog("otp_generated_development", { phone, codePreview: code });
  }

  await sendSMS(phone, `Votre code de vérification MAGRO est : ${code}. Valable 5 minutes.`);

  res.status(200).json({ message: "OTP envoye" });
}));

// Dedicated resend-otp endpoint - doesn't check if user exists since already verified
router.post("/resend-otp", asyncHandler(async (req, res) => {
  const parseResult = z.object({ phone: phoneSchema }).safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { phone } = parseResult.data;

  // Clean up expired OTPs
  await prisma.loginOtp.deleteMany({
    where: {
      phone,
      OR: [
        { expiresAt: { lt: new Date() } },
        { createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) } }
      ]
    }
  });

  // Rate limiting - allow more resends
  const recentOtpCount = await prisma.loginOtp.count({
    where: { phone, createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } }
  });
  if (recentOtpCount >= 5) {
    securityLog("otp_resend_rate_limited", { phone, ip: getClientIp(req) });
    return res.status(429).json({ error: "Trop de tentatives. Réessayez dans quelques minutes." });
  }

  const code = (phone.startsWith("+2237000000") || phone.startsWith("+2239000000") || phone === "+22399999999") ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.loginOtp.create({
    data: { phone, codeHash, expiresAt }
  });

  if (process.env.NODE_ENV !== "production" || phone.startsWith("+2237000000")) {
    console.log(`[DEV/TEST] OTP FULL CODE FOR ${phone}: ${code}`);
    securityLog("otp_resend_development", { phone, codePreview: code });
  }

  await sendSMS(phone, `Votre code de vérification MAGRO est : ${code}. Valable 5 minutes.`);

  res.status(200).json({ message: "OTP renvoyé" });
}));

router.post("/verify-otp", asyncHandler(async (req, res) => {
  const parseResult = verifyOtpSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { phone, otp, name, role } = parseResult.data;
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

  let user = await prisma.user.findUnique({ where: { phone } });

  if (user && user.suspensionUntil && new Date() < user.suspensionUntil) {
    securityLog("login_failed_suspended", { phone, ip: getClientIp(req) });
    return res.status(403).json({ error: "Votre compte a été suspendu par un administrateur." });
  }

  user = await prisma.user.upsert({
    where: { phone },
    update: {
      ...(name && { name }),
      ...(role && { role })
    },
    create: {
      phone,
      name: name || `Utilisateur ${phone.slice(-4)}`,
      role: role || "BUYER",
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
}));

router.post("/refresh", asyncHandler(async (req, res) => {
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
}));

router.post("/logout", asyncHandler(async (req, res) => {
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
}));

router.post("/google/login", asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Missing credential" });
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const payload = (await response.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
      email_verified?: string | boolean;
      aud: string;
    };

    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      securityLog("google_login_failed_aud", { ip: getClientIp(req) });
      return res.status(401).json({ error: "Invalid audience" });
    }

    if (payload.email_verified !== "true" && payload.email_verified !== true) {
      return res.status(401).json({ error: "Email not verified by Google" });
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (user && user.suspensionUntil && new Date() < user.suspensionUntil) {
      securityLog("google_login_failed_suspended", { email: payload.email, ip: getClientIp(req) });
      return res.status(403).json({ error: "Votre compte a été suspendu par un administrateur." });
    }

    if (!user) {
      return res.status(404).json({ error: "Aucun compte trouvé avec cet email. Veuillez vous inscrire." });
    } else {
      if (payload.picture && user.avatarUrl !== payload.picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: payload.picture }
        });
      }
    }

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
    securityLog("google_login_success", { userId: user.id, ip: getClientIp(req) });

    res.json({
      user: publicUser(user),
      accessToken
    });
  } catch (err) {
    console.error("Google authentication error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
}));

router.post("/google/signup", asyncHandler(async (req, res) => {
  const { credential, role, name, phone } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Missing credential" });
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const payload = (await response.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
      email_verified?: string | boolean;
      aud: string;
    };

    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: "Invalid audience" });
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (user && user.suspensionUntil && new Date() < user.suspensionUntil) {
      return res.status(403).json({ error: "Votre compte a été suspendu par un administrateur." });
    }

    if (user) {
      return res.status(400).json({ error: "Un compte existe déjà avec cet email. Veuillez vous connecter." });
    }

    user = await prisma.user.create({
      data: {
        phone: phone || `google-${payload.sub}`,
        email: payload.email,
        name: name || payload.name,
        avatarUrl: payload.picture || null,
        role: role ? role.toUpperCase() : "BUYER",
        passwordHash: await bcrypt.hash(`google-only:${payload.sub}:${Date.now()}`, 12),
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
    res.status(201).json({
      user: publicUser(user),
      accessToken
    });
  } catch (err) {
    console.error("Google signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
}));

export default router;
