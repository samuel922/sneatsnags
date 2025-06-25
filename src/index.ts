import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/config";
import { logger } from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./routes/auth";
import { setupSwagger } from "./config/swagger";

const app = express();

//Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

//Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter);

//Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//Swagger documentation
setupSwagger(app);

//Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toString() });
});

//Routes
app.use("/api/auth", authRoutes);

//Error handling
app.use(errorHandler);

//404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = config.PORT || 5001;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
