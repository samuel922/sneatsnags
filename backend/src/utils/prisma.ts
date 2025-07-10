import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("query", (e: any) => {
  logger.debug("Query: " + e.query);
  logger.debug("Duration: " + e.duration);
});

prisma.$on("error", (e: any) => {
  logger.error("Prisma error: " + e);
});
