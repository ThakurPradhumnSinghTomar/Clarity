
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Decide this secret ONCE and use same in whoever generates the token
const BACKEND_JWT_SECRET = process.env.JWT_SECRET!;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Expecting: Authorization: Bearer <token>
  if (!authHeader) {
    return res.status(401).json({ message: "No Authorization header" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }

  const token = parts[1];

  if(!token){
    return res.status(401).json({message:"No token in Auth headers"});
  }

  try {
    // jwt.verify throws if invalid/expired
    const decoded = jwt.verify(token, BACKEND_JWT_SECRET) as any;

    // Attach to req.user → now all protected routes can use it
    req.user = {
      id:  decoded.id, // depending on how you sign it
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
