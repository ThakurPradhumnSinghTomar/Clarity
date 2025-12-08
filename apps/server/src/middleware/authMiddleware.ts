
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Decide this secret ONCE and use same in whoever generates the token
const BACKEND_JWT_SECRET = process.env.JWT_SECRET!;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  console.log("incoming request has this authorization header : ",authHeader);

  // Expecting: Authorization: Bearer <token>
  if (!authHeader) {
    console.log("No Authorization header, middleware block your reequest");
    return res.status(401).json({ message: "No Authorization header, middleware block your reequest" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.log("Invalid Authorization header, middleware block your reequest");
    return res.status(401).json({ message: "Invalid Authorization header, middleware block your reequest" });
  }

  const token = parts[1];

  if(!token){
    console.log("No token in Auth headers, middleware block your reequest");
    return res.status(401).json({message:"No token in Auth headers, middleware block your reequest"});
  }

  try {
    // jwt.verify throws if invalid/expired
    const decoded = jwt.verify(token, BACKEND_JWT_SECRET) as any;

    // Attach to req.user → now all protected routes can use it

    if(decoded.userId===undefined){
      console.log("No user id in Auth header token, middleware block your reequest",decoded.email);
      return res.status(401).json({message:"No userid in token in Auth headers, middleware block your reequest"});
    }
    req.user = {
      id:  decoded.userId, // depending on how you sign it
      email: decoded.email,
    };

    console.log("incoming request passed from middleware");

    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
