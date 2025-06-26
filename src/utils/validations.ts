import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  role: z.enum(["BUYER", "SELLER", "BROKER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
});

export const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["BUYER", "SELLER", "BROKER", "ADMIN"]),
});

export const createOfferSchema = z.object({
  eventId: z.string(),
  maxPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  sectionIds: z.array(z.string()).nonempty(),
  message: z.string().optional(),
  expiresAt: z.coerce.date(),
});

export const updateOfferSchema = createOfferSchema.partial();
