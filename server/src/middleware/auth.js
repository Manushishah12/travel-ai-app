import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Missing or invalid Authorization header" });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: `${config.jwtExpireDays}d`,
  });
}
