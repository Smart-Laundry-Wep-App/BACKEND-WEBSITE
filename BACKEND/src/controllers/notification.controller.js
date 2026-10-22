import { db } from "../models/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getNotifications = (req, res, next) => {
  try {
    const { search = "", status = "Semua", page = 1, limit = 10 } = req.query;

    let notifs = db.findAll("notifications");

    if (status && status !== "Semua") {
      notifs = notifs.filter((n) => n.status.toLowerCase() === status.toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      notifs = notifs.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.recipient && n.recipient.toLowerCase().includes(q)) ||
          (n.orderId && n.orderId.toLowerCase().includes(q))
      );
    }

    const total = notifs.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = notifs.slice(startIndex, startIndex + limitNum);

    return successResponse(
      res,
      {
        notifications: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      },
      "Data notifikasi berhasil dimuat"
    );
  } catch (err) {
    next(err);
  }
};

export const sendNotification = (req, res, next) => {
  try {
    const { title, message, recipient, orderId = "ALL", channel = "WhatsApp" } = req.body;

    if (!title || !message) {
      return errorResponse(res, "Judul dan pesan notifikasi wajib diisi", 400);
    }

    const newNotif = {
      id: `notif-${Date.now().toString(36)}`,
      orderId,
      title: title.trim(),
      message: message.trim(),
      recipient: recipient || "Semua Pelanggan",
      channel,
      status: "Terkirim",
      createdAt: new Date().toISOString(),
    };

    db.create("notifications", newNotif);

    return successResponse(res, newNotif, "Notifikasi berhasil dikirim", 201);
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.delete("notifications", id);

    if (!deleted) {
      return errorResponse(res, `Notifikasi dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, null, `Notifikasi "${id}" berhasil dihapus`);
  } catch (err) {
    next(err);
  }
};
