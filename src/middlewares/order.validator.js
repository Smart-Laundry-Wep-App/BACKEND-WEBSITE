import { errorResponse } from "../utils/response.js";

/**
 * Validator Middleware untuk Pesanan (Order)
 * Aturan Validasi:
 * 1. Berat di bawah 1 tidak bisa (minimal 1 kg)
 * 2. Nomor telepon harus angka, huruf ditolak
 * 3. Nama wajib huruf, angka ditolak
 * 4. Jenis layanan tidak boleh angka
 */

export const validateCreateOrder = (req, res, next) => {
  const { customer, phone, service, weight, pricePerKg } = req.body;
  const errors = {};

  // 1. Validasi Nama Pelanggan: Wajib huruf, angka tolak
  if (!customer || !String(customer).trim()) {
    errors.customer = "Nama pelanggan wajib diisi";
  } else {
    const trimmedCustomer = String(customer).trim();
    if (/[0-9]/.test(trimmedCustomer)) {
      errors.customer = "Nama pelanggan wajib huruf (angka ditolak)";
    } else if (!/^[a-zA-Z\s'.\-]+$/.test(trimmedCustomer)) {
      errors.customer = "Nama pelanggan hanya boleh berisi huruf dan tanda baca nama";
    }
  }

  // 2. Validasi Nomor Telepon: Harus angka, huruf tolak
  if (!phone || !String(phone).trim()) {
    errors.phone = "Nomor telepon wajib diisi";
  } else {
    const phoneStr = String(phone).trim();
    if (/[a-zA-Z]/.test(phoneStr)) {
      errors.phone = "Nomor telepon hanya boleh berisi angka (huruf ditolak)";
    } else if (!/^[0-9+\s\-]+$/.test(phoneStr) || !/^[0-9]+$/.test(phoneStr.replace(/[\s\-+]/g, ""))) {
      errors.phone = "Nomor telepon hanya boleh berisi format angka yang valid";
    }
  }

  // 3. Validasi Jenis Layanan: Tidak boleh angka
  if (!service || !String(service).trim()) {
    errors.service = "Jenis layanan wajib diisi";
  } else {
    const serviceStr = String(service).trim();
    if (/[0-9]/.test(serviceStr)) {
      errors.service = "Jenis layanan tidak boleh mengandung angka";
    }
  }

  // 4. Validasi Berat: Di bawah 1 tidak bisa
  if (weight == null || weight === "") {
    errors.weight = "Berat cucian wajib diisi";
  } else {
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight < 1) {
      errors.weight = "Berat cucian minimal 1 kg (berat di bawah 1 tidak diperbolehkan)";
    }
  }

  // Validasi Tarif per kg
  if (pricePerKg == null || pricePerKg === "") {
    errors.pricePerKg = "Tarif per kg wajib diisi";
  } else {
    const parsedPrice = parseFloat(pricePerKg);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.pricePerKg = "Tarif per kg harus lebih besar dari 0";
    }
  }

  if (Object.keys(errors).length > 0) {
    const firstErrorMessage = Object.values(errors)[0];
    return errorResponse(res, firstErrorMessage, 400, errors);
  }

  next();
};

export const validateUpdateOrder = (req, res, next) => {
  const { customer, phone, service, weight, pricePerKg } = req.body;
  const errors = {};

  if (customer !== undefined) {
    const trimmedCustomer = String(customer).trim();
    if (!trimmedCustomer) {
      errors.customer = "Nama pelanggan tidak boleh kosong";
    } else if (/[0-9]/.test(trimmedCustomer)) {
      errors.customer = "Nama pelanggan wajib huruf (angka ditolak)";
    } else if (!/^[a-zA-Z\s'.\-]+$/.test(trimmedCustomer)) {
      errors.customer = "Nama pelanggan hanya boleh berisi huruf dan tanda baca nama";
    }
  }

  if (phone !== undefined) {
    const phoneStr = String(phone).trim();
    if (!phoneStr) {
      errors.phone = "Nomor telepon tidak boleh kosong";
    } else if (/[a-zA-Z]/.test(phoneStr)) {
      errors.phone = "Nomor telepon hanya boleh berisi angka (huruf ditolak)";
    } else if (!/^[0-9+\s\-]+$/.test(phoneStr) || !/^[0-9]+$/.test(phoneStr.replace(/[\s\-+]/g, ""))) {
      errors.phone = "Nomor telepon hanya boleh berisi format angka yang valid";
    }
  }

  if (service !== undefined) {
    const serviceStr = String(service).trim();
    if (!serviceStr) {
      errors.service = "Jenis layanan tidak boleh kosong";
    } else if (/[0-9]/.test(serviceStr)) {
      errors.service = "Jenis layanan tidak boleh mengandung angka";
    }
  }

  if (weight !== undefined) {
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight < 1) {
      errors.weight = "Berat cucian minimal 1 kg (berat di bawah 1 tidak diperbolehkan)";
    }
  }

  if (pricePerKg !== undefined) {
    const parsedPrice = parseFloat(pricePerKg);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.pricePerKg = "Tarif per kg harus lebih besar dari 0";
    }
  }

  if (Object.keys(errors).length > 0) {
    const firstErrorMessage = Object.values(errors)[0];
    return errorResponse(res, firstErrorMessage, 400, errors);
  }

  next();
};
