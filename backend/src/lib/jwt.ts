import jwt, { SignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { getRequiredSecret } from "./security.js";

const accessSecret = getRequiredSecret("ACCESS_TOKEN_SECRET");
const refreshSecret = getRequiredSecret("REFRESH_TOKEN_SECRET");

export interface AccessTokenPayload {
  userId: string;
  role: string;
  name: string;
  phone: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function signAccessToken(payload: AccessTokenPayload) {
  const expiresIn = (process.env.ACCESS_TOKEN_TTL ?? "15m") as SignOptions["expiresIn"];
  return jwt.sign(payload, accessSecret, {
    algorithm: "HS256",
    expiresIn,
    issuer: "magro-api",
    audience: "magro-client"
  });
}

export function signRefreshToken(userId: string, tokenId = randomUUID()) {
  const expiresIn = (process.env.REFRESH_TOKEN_TTL ?? "7d") as SignOptions["expiresIn"];
  const token = jwt.sign({ userId, tokenId }, refreshSecret, {
    algorithm: "HS256",
    expiresIn,
    issuer: "magro-api",
    audience: "magro-client"
  });

  return { token, tokenId };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret, {
    algorithms: ["HS256"],
    issuer: "magro-api",
    audience: "magro-client"
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret, {
    algorithms: ["HS256"],
    issuer: "magro-api",
    audience: "magro-client"
  });
}
