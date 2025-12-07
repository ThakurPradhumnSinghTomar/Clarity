// src/types/express.d.ts
import * as express from "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email?: string;
    }

    interface Request {
      user?: UserPayload;
      id?: string
    }
  }
}
