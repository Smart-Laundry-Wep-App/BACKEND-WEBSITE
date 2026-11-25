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

    // 1. Validasi Nama Pelanggan: Wajib huruf, angka tolak
    const trimmedCustomer = String(customer).trim();
    if (/[0-9]/.test(trimmedCustomer)) {
      return errorResponse(res, "Nama pelanggan wajib huruf (angka ditolak)", 400);
    }
    if (!/^[a-zA-Z\s'.\-]+$/.test(trimmedCustomer)) {
      return errorResponse(res, "Nama pelanggan hanya boleh berisi huruf", 400);
    }

    // 2. Validasi Nomor Telepon: Harus angka, huruf tolak
    const phoneStr = String(phone).trim();
    if (/[a-zA-Z]/.test(phoneStr)) {
      return errorResponse(res, "Nomor telepon hanya boleh berisi angka (huruf ditolak)", 400);
    }
    if (!/^[0-9+\s\-]+$/.test(phoneStr) || !/^[0-9]+$/.test(phoneStr.replace(/[\s\-+]/g, ""))) {
      return errorResponse(res, "Nomor telepon hanya boleh berisi format angka yang valid", 400);
    }

    // 3. Validasi Jenis Layanan: Tidak boleh angka
    const serviceStr = String(service).trim();
    if (/[0-9]/.test(serviceStr)) {
      return errorResponse(res, "Jenis layanan tidak boleh mengandung angka", 400);
    }

    const parsedWeight = parseFloat(weight);
    const parsedPrice = parseFloat(pricePerKg);

    // 4. Validasi Berat: Di bawah 1 tidak bisa
    if (isNaN(parsedWeight) || parsedWeight < 1) {
      return errorResponse(res, "Berat cucian minimal 1 kg (berat di bawah 1 tidak diperbolehkan)", 400);
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
      customer: trimmedCustomer,
      phone: phoneStr,
      service: serviceStr,
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

    // Validasi saat update jika field disertakan
    if (updates.customer !== undefined) {
      const trimmedCustomer = String(updates.customer).trim();
      if (!trimmedCustomer) {
        return errorResponse(res, "Nama pelanggan tidak boleh kosong", 400);
      }
      if (/[0-9]/.test(trimmedCustomer)) {
        return errorResponse(res, "Nama pelanggan wajib huruf (angka ditolak)", 400);
      }
      if (!/^[a-zA-Z\s'.\-]+$/.test(trimmedCustomer)) {
        return errorResponse(res, "Nama pelanggan hanya boleh berisi huruf", 400);
      }
      updates.customer = trimmedCustomer;
    }

    if (updates.phone !== undefined) {
      const phoneStr = String(updates.phone).trim();
      if (!phoneStr) {
        return errorResponse(res, "Nomor telepon tidak boleh kosong", 400);
      }
      if (/[a-zA-Z]/.test(phoneStr)) {
        return errorResponse(res, "Nomor telepon hanya boleh berisi angka (huruf ditolak)", 400);
      }
      if (!/^[0-9+\s\-]+$/.test(phoneStr) || !/^[0-9]+$/.test(phoneStr.replace(/[\s\-+]/g, ""))) {
        return errorResponse(res, "Nomor telepon hanya boleh berisi format angka yang valid", 400);
      }
      updates.phone = phoneStr;
    }

    if (updates.service !== undefined) {
      const serviceStr = String(updates.service).trim();
      if (!serviceStr) {
        return errorResponse(res, "Jenis layanan tidak boleh kosong", 400);
      }
      if (/[0-9]/.test(serviceStr)) {
        return errorResponse(res, "Jenis layanan tidak boleh mengandung angka", 400);
      }
      updates.service = serviceStr;
    }

    if (updates.weight != null || updates.pricePerKg != null) {
      const weight = updates.weight != null ? parseFloat(updates.weight) : order.weight;
      const price = updates.pricePerKg != null ? parseFloat(updates.pricePerKg) : order.pricePerKg;

      if (isNaN(weight) || weight < 1) {
        return errorResponse(res, "Berat cucian minimal 1 kg (berat di bawah 1 tidak diperbolehkan)", 400);
      }
      if (isNaN(price) || price <= 0) {
        return errorResponse(res, "Tarif per kg harus lebih besar dari 0", 400);
      }

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
