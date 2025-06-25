import dotenv from "dotenv";

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5001"),

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  // Email
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  FROM_EMAIL: process.env.FROM_EMAIL || "noreply@automatchtickets.com",
  FROM_NAME: process.env.FROM_NAME || "AutoMatch Tickets",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3001",

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Ticketmaster
  TICKETMASTER_API_KEY: process.env.TICKETMASTER_API_KEY || "",
  TICKETMASTER_API_SECRET: process.env.TICKETMASTER_API_SECRET || "",

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880"),
  UPLOAD_PATH: process.env.UPLOAD_PATH || "/uploads",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100"
  ),
};
