import { verifyToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/response.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Akses ditolak. Token autentikasi tidak ditemukan.", 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return errorResponse(res, "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.", 401);
  }

  req.user = decoded;
  next();
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};
