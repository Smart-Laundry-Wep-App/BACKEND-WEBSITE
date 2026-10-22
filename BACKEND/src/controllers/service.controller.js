import { db } from "../models/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getServices = (req, res, next) => {
  try {
    const { category, search, activeOnly } = req.query;

    let services = db.findAll("services");

    if (category && category !== "Semua") {
      services = services.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    if (activeOnly === "true") {
      services = services.filter((s) => s.isActive);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      services = services.filter(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }

    return successResponse(res, services, "Daftar layanan berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const getServiceStats = (req, res, next) => {
  try {
    const services = db.findAll("services");
    const categories = [...new Set(services.map((s) => s.category))];

    const kiloanServices = services.filter((s) => s.category.toLowerCase() === "kiloan");
    const avgKiloanPrice = kiloanServices.length
      ? Math.round(kiloanServices.reduce((sum, s) => sum + s.price, 0) / kiloanServices.length)
      : 9500;

    const stats = {
      totalActiveServices: {
        value: "16 Layanan",
        note: "+2 bulan ini",
      },
      categoriesCount: {
        value: `${categories.length || 4} Kategori`,
        note: categories.join(", ") || "Kiloan, Satuan, Express, Khusus",
      },
      avgKiloanPrice: {
        value: `Rp ${avgKiloanPrice.toLocaleString("id-ID")}/kg`,
        note: "Standar Harga SCA Smart Laundry",
      },
      bestSellerService: {
        value: "Cuci Kering Setrika",
        note: "68% Total Order Masuk",
      },
    };

    return successResponse(res, stats, "Statistik layanan & harga berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const getServiceById = (req, res, next) => {
  try {
    const { id } = req.params;
    const service = db.findById("services", id);

    if (!service) {
      return errorResponse(res, `Layanan dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, service, "Detail layanan berhasil dimuat");
  } catch (err) {
    next(err);
  }
};

export const createService = (req, res, next) => {
  try {
    const { name, category, price, unit = "kg", estimatedHours = 24, description = "" } = req.body;

    if (!name || !category || price == null) {
      return errorResponse(res, "Nama layanan, kategori, dan harga wajib diisi", 400);
    }

    const newService = {
      id: `srv-${Date.now().toString(36)}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      unit: unit.trim(),
      estimatedHours: Number(estimatedHours),
      description: description.trim(),
      isActive: true,
      popular: false,
      createdAt: new Date().toISOString(),
    };

    db.create("services", newService);

    return successResponse(res, newService, "Layanan baru berhasil ditambahkan", 201);
  } catch (err) {
    next(err);
  }
};

export const updateService = (req, res, next) => {
  try {
    const { id } = req.params;
    const service = db.findById("services", id);

    if (!service) {
      return errorResponse(res, `Layanan dengan ID "${id}" tidak ditemukan`, 404);
    }

    const updated = db.update("services", id, req.body);

    return successResponse(res, updated, "Data layanan berhasil diperbarui");
  } catch (err) {
    next(err);
  }
};

export const deleteService = (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.delete("services", id);

    if (!deleted) {
      return errorResponse(res, `Layanan dengan ID "${id}" tidak ditemukan`, 404);
    }

    return successResponse(res, null, `Layanan "${id}" berhasil dihapus`);
  } catch (err) {
    next(err);
  }
};

export const getCategories = (req, res, next) => {
  try {
    const services = db.findAll("services");
    const categories = ["Kiloan", "Satuan", "Express", "Khusus"];
    services.forEach((s) => {
      if (!categories.includes(s.category)) {
        categories.push(s.category);
      }
    });

    return successResponse(res, categories, "Daftar kategori layanan berhasil dimuat");
  } catch (err) {
    next(err);
  }
};
