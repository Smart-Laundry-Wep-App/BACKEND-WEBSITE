import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().regex(/^\d+(s|m|h|d|w|y)$/).default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().default("sca_laundry"),
  DB_PASSWORD: z.string().default(""),
  DB_SSL_CA: z.string().optional(),
  DB_NAME: z.string().default("sca_smart_laundry"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
}).superRefine((env, context) => {
  if (/replace-with|change-me|example/i.test(env.JWT_SECRET)) {
    context.addIssue({ code: "custom", path: ["JWT_SECRET"], message: "Set a private, randomly generated JWT_SECRET" });
  }
  if (env.NODE_ENV === "production" && !env.DB_PASSWORD) {
    context.addIssue({ code: "custom", path: ["DB_PASSWORD"], message: "DB_PASSWORD is required in production" });
  }
  if (env.NODE_ENV === "production" && /replace-with|change-me|example/i.test(env.DB_PASSWORD)) {
    context.addIssue({ code: "custom", path: ["DB_PASSWORD"], message: "Set a private database password in production" });
  }
  if (env.NODE_ENV === "production" && env.CORS_ORIGIN.split(",").some((origin) => origin.trim() === "*")) {
    context.addIssue({ code: "custom", path: ["CORS_ORIGIN"], message: "Wildcard CORS is not allowed in production" });
  }
});

export const config = envSchema.parse(process.env);
