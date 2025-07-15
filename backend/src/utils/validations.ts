import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").transform((val: string) => val.trim()),
  lastName: z.string().min(1, "Last name is required").transform((val: string) => val.trim()),
  phone: z.string().optional().nullable().transform((val: string | null | undefined) => val?.trim() || undefined),
  role: z.enum(["BUYER", "SELLER", "BROKER", "ADMIN"]).optional(),
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

export const offerSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(["createdAt", "maxPrice", "expiresAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  eventId: z.string().cuid().optional(),
  status: z.enum(["ACTIVE", "ACCEPTED", "EXPIRED", "CANCELLED"]).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export const eventSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(["eventDate", "name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  eventType: z
    .enum(["SPORTS", "CONCERT", "THEATER", "COMEDY", "OTHER"])
    .optional(),
  category: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
});
