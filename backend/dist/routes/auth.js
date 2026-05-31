import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { z } from "zod";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
const router = Router();
const requestOtpSchema = z.object({ phone: z.string().min(3) });
const verifyOtpSchema = z.object({ phone: z.string().min(3), otp: z.string().length(6) });
router.post("/request-otp", async (req, res) => {
    const parseResult = requestOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid payload" });
    }
    const { phone } = parseResult.data;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.loginOtp.create({
        data: { phone, codeHash, expiresAt }
    });
    console.log(`OTP for ${phone}: ${code}`);
    res.status(200).json({ message: "OTP envoyé" });
});
router.post("/verify-otp", async (req, res) => {
    const parseResult = verifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid payload" });
    }
    const { phone, otp } = parseResult.data;
    const otpRecord = await prisma.loginOtp.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ error: "Code OTP invalide ou expiré" });
    }
    const isValid = await bcrypt.compare(otp, otpRecord.codeHash);
    if (!isValid) {
        return res.status(400).json({ error: "Code OTP invalide" });
    }
    await prisma.loginOtp.deleteMany({ where: { phone } });
    const user = await prisma.user.upsert({
        where: { phone },
        update: {},
        create: {
            phone,
            name: `Utilisateur ${phone.slice(-4)}`
        }
    });
    const accessToken = signAccessToken({ userId: user.id, role: user.role, name: user.name, phone: user.phone });
    const refreshToken = signRefreshToken({ userId: user.id });
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userId: user.id
        }
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ user, accessToken });
});
router.post("/refresh", async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ error: "Missing refresh token" });
    }
    const refreshRecord = await prisma.refreshToken.findUnique({ where: { token } });
    if (!refreshRecord || refreshRecord.expiresAt < new Date()) {
        return res.status(401).json({ error: "Refresh token expired" });
    }
    try {
        const decoded = verifyRefreshToken(token);
        const { userId } = decoded;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        const accessToken = signAccessToken({ userId: user.id, role: user.role, name: user.name, phone: user.phone });
        return res.json({ accessToken });
    }
    catch {
        return res.status(401).json({ error: "Invalid refresh token" });
    }
});
router.post("/logout", async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Déconnecté" });
});
export default router;
