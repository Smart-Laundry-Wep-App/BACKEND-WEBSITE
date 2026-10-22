import { errorResponse } from "../utils/response.js";
import { config } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan internal pada server";
  const errors = config.nodeEnv === "development" ? { stack: err.stack } : null;

  return errorResponse(res, message, statusCode, errors);
};
