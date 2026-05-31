import jwt from "jsonwebtoken";

const accessSecret = process.env.ACCESS_TOKEN_SECRET ?? "change_this_secret";
const refreshSecret = process.env.REFRESH_TOKEN_SECRET ?? "change_this_secret";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, accessSecret, { expiresIn: "15m" });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret);
}
