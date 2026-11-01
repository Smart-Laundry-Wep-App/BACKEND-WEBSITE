import { db } from "../models/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getPayments = (req, res, next) => {
  try {
    const { status = "Semua", search = "", startDate, endDate, page = 1, limit = 10 } = req.query;

    let payments = db.findAll("payments");

    if (status && status !== "Semua") {
      payments = payments.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          p.customer.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q)
      );
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      payments = payments.filter((p) => new Date(p.paidAt || p.createdAt || 0).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      payments = payments.filter((p) => new Date(p.paidAt || p.createdAt || 0).getTime() <= end);
    }

    const total = payments.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = payments.slice(startIndex, startIndex + limitNum);

    return successResponse(
      res,
      {
        payments: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      },
      "Data pembayaran berhasil dimuat"
    );
  } catch (err) {
    next(err);
  }
};

export const getPaymentStats = (req, res, next) => {
  try {
    const payments = db.findAll("payments");

    const totalIncome = payments
      .filter((p) => p.status === "Lunas")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const paidCount = payments.filter((p) => p.status === "Lunas").length;
    const pendingCount = payments.filter((p) => p.status === "Belum Bayar").length;
    const failedCount = payments.filter((p) => p.status === "Gagal").length;

    const stats = {
      totalRevenue: totalIncome,
      formattedRevenue: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(totalIncome),
      paidCount,
      pendingCount,
      failedCount,
      totalTransactions: payments.length,
    };

    return successResponse(res, stats, "Statistik pembayaran berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const getPaymentById = (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = db.findById("payments", id);

    if (!payment) {
      return errorResponse(res, `Pembayaran dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, payment, "Detail pembayaran berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const createPayment = (req, res, next) => {
  try {
    const { orderId, customer, amount, method = "QRIS", status = "Lunas" } = req.body;

    if (!orderId || !amount) {
      return errorResponse(res, "ID Pesanan dan jumlah nominal wajib diisi", 400);
    }

    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      orderId,
      customer: customer || "Pelanggan",
      amount: Number(amount),
      method,
      status,
      paidAt: status === "Lunas" ? new Date().toISOString() : null,
      referenceNumber: `REF-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
    };

    db.create("payments", newPayment);

    // Update order status if order exists
    const order = db.findById("orders", orderId);
    if (order && status === "Lunas") {
      db.update("orders", orderId, {
        paymentStatus: "Lunas",
        paymentMethod: method,
      });
    }

    return successResponse(res, newPayment, "Data pembayaran berhasil dibuat", 201);
  } catch (err) {
    next(err);
  }
};

export const updatePaymentStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, referenceNumber } = req.body;

    if (!status) {
      return errorResponse(res, "Status pembayaran harus disertakan", 400);
    }

    const payment = db.findById("payments", id);
    if (!payment) {
      return errorResponse(res, `Pembayaran dengan ID "${id}" tidak ditemukan`, 404);
    }

    const updates = {
      status,
      ...(status === "Lunas" ? { paidAt: new Date().toISOString() } : {}),
      ...(referenceNumber ? { referenceNumber } : {}),
    };

    const updated = db.update("payments", id, updates);

    // Also sync order
    if (payment.orderId) {
      db.update("orders", payment.orderId, {
        paymentStatus: status,
      });
    }

    return successResponse(res, updated, `Status pembayaran berhasil diubah menjadi "${status}"`);
  } catch (err) {
    next(err);
  }
};

export const deletePayment = (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.delete("payments", id);

    if (!deleted) {
      return errorResponse(res, `Pembayaran dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, null, `Pembayaran "${id}" berhasil dihapus`);
  } catch (err) {
    next(err);
  }
};
