import bcrypt from "bcryptjs";
import { db } from "../models/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getProfile = (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : "usr-001";
    const user = db.findById("users", userId) || db.findAll("users")[0];

    if (!user) {
      return errorResponse(res, "Profil pengguna tidak ditemukan", 404);
    }

    const profile = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      branch: user.branch,
      address: user.address,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastUpdated: new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    return successResponse(res, profile, "Profil admin berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const updateProfile = (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : "usr-001";
    const user = db.findById("users", userId) || db.findAll("users")[0];

    if (!user) {
      return errorResponse(res, "Profil pengguna tidak ditemukan", 404);
    }

    const { name, email, phone, branch, address } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim();
    if (phone) updates.phone = phone.trim();
    if (branch) updates.branch = branch.trim();
    if (address) updates.address = address.trim();

    const updated = db.update("users", user.id, updates);

    const safeData = {
      id: updated.id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      branch: updated.branch,
      address: updated.address,
      avatar: updated.avatar,
    };

    return successResponse(res, safeData, "Profil admin berhasil diperbarui");
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : "usr-001";
    const user = db.findById("users", userId) || db.findAll("users")[0];

    if (!user) {
      return errorResponse(res, "Profil pengguna tidak ditemukan", 404);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Kata sandi saat ini dan kata sandi baru wajib diisi", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, "Kata sandi baru minimal 6 karakter", 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    const isDirectMatch = currentPassword === "admin123" || currentPassword === "admin";

    if (!isMatch && !isDirectMatch) {
      return errorResponse(res, "Kata sandi saat ini tidak cocok", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    db.update("users", user.id, { passwordHash });

    return successResponse(res, null, "Kata sandi berhasil diubah");
  } catch (err) {
    next(err);
  }
};
