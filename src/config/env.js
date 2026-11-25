import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (
  !jwtSecret ||
  jwtSecret.length < 32 ||
  /replace-with|change-me|example/i.test(jwtSecret)
) {
  throw new Error(
    "JWT_SECRET must be set to a private random secret of at least 32 characters"
  );
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
