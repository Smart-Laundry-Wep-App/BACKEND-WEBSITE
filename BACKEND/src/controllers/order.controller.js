import { db } from "../models/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getOrders = (req, res, next) => {
  try {
    const { search = "", status = "Semua", page = 1, limit = 10 } = req.query;

    let orders = db.findAll("orders");

    // Filter by status
    if (status && status !== "Semua") {
      orders = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }

    // Filter by search (id, customer, phone, service)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.service.toLowerCase().includes(q)
      );
    }

    const total = orders.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = orders.slice(startIndex, startIndex + limitNum);

    return successResponse(
      res,
      {
        orders: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
      "Data pesanan berhasil dimuat"
    );
  } catch (err) {
    next(err);
  }
};

export const getOrderById = (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.findById("orders", id);

    if (!order) {
      return errorResponse(res, `Pesanan dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, order, "Detail pesanan berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const createOrder = (req, res, next) => {
  try {
    const {
      customer,
      phone,
      service,
      weight,
      pricePerKg,
      status = "Sedang Cuci",
      paymentMethod = "Tunai",
      notes = "",
    } = req.body;

    if (!customer || !phone || !service || weight == null || pricePerKg == null) {
      return errorResponse(
        res,
        "Customer, telepon, jenis layanan, berat (kg), dan tarif per kg wajib diisi",
        400
      );
    }

    const parsedWeight = parseFloat(weight);
    const parsedPrice = parseFloat(pricePerKg);

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return errorResponse(res, "Berat cucian harus lebih besar dari 0", 400);
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return errorResponse(res, "Tarif per kg harus lebih besar dari 0", 400);
    }

    // Generate unique order ID (ORD-XXXX)
    const existingOrders = db.findAll("orders");
    const nextNum = 8920 + existingOrders.length + 1;
    const orderId = `ORD-${nextNum}`;

    const totalAmount = Math.round(parsedWeight * parsedPrice);

    const newOrder = {
      id: orderId,
      customer: customer.trim(),
      phone: phone.trim(),
      service: service.trim(),
      weight: parsedWeight,
      pricePerKg: parsedPrice,
      totalAmount,
      status,
      paymentStatus: "Belum Bayar",
      paymentMethod,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    db.create("orders", newOrder);

    // Also automatically create a pending payment record
    const newPayment = {
      id: `PAY-${1000 + existingOrders.length + 1}`,
      orderId: newOrder.id,
      customer: newOrder.customer,
      amount: newOrder.totalAmount,
      method: paymentMethod,
      status: "Belum Bayar",
      paidAt: null,
      referenceNumber: "-",
      createdAt: new Date().toISOString(),
    };
    db.create("payments", newPayment);

    return successResponse(res, newOrder, "Pesanan baru berhasil dibuat", 201);
  } catch (err) {
    next(err);
  }
};

export const updateOrder = (req, res, next) => {
  try {
    const { id } = req.params;
    const order = db.findById("orders", id);

    if (!order) {
      return errorResponse(res, `Pesanan dengan ID "${id}" tidak ditemukan`, 404);
    }

    const updates = { ...req.body };
    if (updates.weight != null || updates.pricePerKg != null) {
      const weight = updates.weight != null ? parseFloat(updates.weight) : order.weight;
      const price = updates.pricePerKg != null ? parseFloat(updates.pricePerKg) : order.pricePerKg;
      updates.weight = weight;
      updates.pricePerKg = price;
      updates.totalAmount = Math.round(weight * price);
    }

    const updated = db.update("orders", id, updates);

    return successResponse(res, updated, "Data pesanan berhasil diperbarui");
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, "Status baru harus disertakan", 400);
    }

    const order = db.findById("orders", id);
    if (!order) {
      return errorResponse(res, `Pesanan dengan ID "${id}" tidak ditemukan`, 404);
    }

    const updated = db.update("orders", id, { status });

    return successResponse(res, updated, `Status pesanan berhasil diubah menjadi "${status}"`);
  } catch (err) {
    next(err);
  }
};

export const deleteOrder = (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.delete("orders", id);

    if (!deleted) {
      return errorResponse(res, `Pesanan dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, null, `Pesanan "${id}" berhasil dihapus`);
  } catch (err) {
    next(err);
  }
};
