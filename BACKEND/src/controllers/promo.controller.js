import { db } from "../models/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getPromos = (req, res, next) => {
  try {
    const { activeOnly, search } = req.query;

    let promos = db.findAll("promos");

    if (activeOnly === "true") {
      promos = promos.filter((p) => p.isActive);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      promos = promos.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return successResponse(res, promos, "Daftar promo & voucher berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const getPromoStats = (req, res, next) => {
  try {
    const stats = {
      totalActivePromos: {
        value: "8 Promo",
        note: "+2 bulan ini",
      },
      totalClaims: {
        value: "1.425 x",
        note: "Meningkat 18%",
      },
      estimatedCustomerSavings: {
        value: "Rp 12.850.000",
        note: "Total subsidi diskon",
      },
      mostUsedCoupon: {
        value: "DISKONMEMBER",
        note: "412 x Digunakan",
      },
    };

    return successResponse(res, stats, "Statistik promo berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const getPromoById = (req, res, next) => {
  try {
    const { id } = req.params;
    const promo = db.findById("promos", id);

    if (!promo) {
      return errorResponse(res, `Promo dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, promo, "Detail promo berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const createPromo = (req, res, next) => {
  try {
    const {
      code,
      title,
      discountType = "percentage",
      discountValue,
      minTransaction = 0,
      maxDiscount = 0,
      validUntil,
      description = "",
    } = req.body;

    if (!code || !title || discountValue == null) {
      return errorResponse(res, "Kode kupon, judul promo, dan nilai diskon wajib diisi", 400);
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = db.findOne("promos", (p) => p.code.toUpperCase() === cleanCode);
    if (existing) {
      return errorResponse(res, `Kode kupon "${cleanCode}" sudah digunakan`, 409);
    }

    const newPromo = {
      id: `prm-${Date.now().toString(36)}`,
      code: cleanCode,
      title: title.trim(),
      discountType,
      discountValue: Number(discountValue),
      minTransaction: Number(minTransaction),
      maxDiscount: Number(maxDiscount),
      validUntil: validUntil || "2026-12-31",
      claimCount: 0,
      isActive: true,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    db.create("promos", newPromo);

    return successResponse(res, newPromo, "Promo baru berhasil dibuat", 201);
  } catch (err) {
    next(err);
  }
};

export const updatePromo = (req, res, next) => {
  try {
    const { id } = req.params;
    const promo = db.findById("promos", id);

    if (!promo) {
      return errorResponse(res, `Promo dengan ID "${id}" tidak ditemukan`, 404);
    }

    const updated = db.update("promos", id, req.body);

    return successResponse(res, updated, "Data promo berhasil diperbarui");
  } catch (err) {
    next(err);
  }
};

export const deletePromo = (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.delete("promos", id);

    if (!deleted) {
      return errorResponse(res, `Promo dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, null, `Promo "${id}" berhasil dihapus`);
  } catch (err) {
    next(err);
  }
};

export const validatePromo = (req, res, next) => {
  try {
    const { code, amount } = req.body;

    if (!code || amount == null) {
      return errorResponse(res, "Kode promo dan nominal transaksi wajib disertakan", 400);
    }

    const promo = db.findOne(
      "promos",
      (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.isActive
    );

    if (!promo) {
      return errorResponse(res, "Kode promo tidak valid atau sudah kedaluwarsa", 404);
    }

    const total = Number(amount);
    if (promo.minTransaction && total < promo.minTransaction) {
      return errorResponse(
        res,
        `Minimal transaksi untuk kupon ini adalah Rp ${promo.minTransaction.toLocaleString("id-ID")}`,
        400
      );
    }

    let discount = 0;
    if (promo.discountType === "percentage") {
      discount = (total * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    discount = Math.min(discount, total);

    return successResponse(
      res,
      {
        promo,
        discountAmount: discount,
        finalAmount: total - discount,
      },
      "Kode kupon valid"
    );
  } catch (err) {
    next(err);
  }
};
