import { z } from "zod";

/* ===================== Login ===================== */

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/* ===================== Signup ===================== */

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  imagePath: z.string().url().optional().nullable(),
});

/* ===================== OAuth ===================== */

export const oauthUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional().nullable(),
  provider: z.string().min(1),
  providerId: z.string().min(1),
});
