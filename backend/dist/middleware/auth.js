import { verifyAccessToken } from "../lib/jwt.js";
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.userId,
            role: payload.role,
            name: payload.name,
            phone: payload.phone
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
