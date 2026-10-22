import { errorResponse } from "../utils/response.js";

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
};
