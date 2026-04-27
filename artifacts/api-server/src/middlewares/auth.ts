import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const SESSION_SECRET = process.env.SESSION_SECRET || "sahaax-secret-key";

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, SESSION_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: "30m" });
}
