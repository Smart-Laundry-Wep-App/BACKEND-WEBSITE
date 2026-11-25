import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

if (config.corsOrigin && config.corsOrigin !== "*") {
  config.corsOrigin.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (config.corsOrigin === "*" || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

// Root landing endpoint
app.get("/", (req, res) => {
  res.json({
    name: "SCA Smart Laundry API Server",
    version: "1.0.0",
    docs: "/api",
    health: "/api/health",
  });
});

// API Routes
app.use("/api", apiRoutes);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
