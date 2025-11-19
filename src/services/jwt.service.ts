// src/services/jwt.service.ts
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment");
}

const JWT_SECRET: Secret = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload: string | object | Buffer) {
  // force the compiler to use the correct overload by using `as any`.
  // We validated JWT_SECRET above so this is safe.
  return (jwt as any).sign(payload, JWT_SECRET as any, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string) {
  try {
    return (jwt as any).verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
