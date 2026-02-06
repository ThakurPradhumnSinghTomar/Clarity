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
  body: z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().optional(),
    image: z.string().url("Invalid image URL").optional().or(z.literal("")),
    provider: z.string().min(1, "Provider is required"),
    providerId: z.string().min(1, "Provider ID is required"),
  }),
});
