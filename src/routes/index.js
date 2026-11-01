import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import transactionRoutes from "./transaction.routes.js";
import serviceRoutes from "./service.routes.js";
import promoRoutes from "./promo.routes.js";
import notificationRoutes from "./notification.routes.js";
import profileRoutes from "./profile.routes.js";
import { successResponse } from "../utils/response.js";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  return successResponse(
    res,
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "SCA Smart Laundry API",
      uptime: process.uptime(),
    },
    "Server aktif dan berjalan normal"
  );
});

// API Documentation & Sitemap endpoint
router.get("/", (req, res) => {
  return successResponse(
    res,
    {
      name: "SCA Smart Laundry REST API",
      version: "1.0.0",
      endpoints: {
        health: "GET /api/health",
        auth: {
          login: "POST /api/auth/login",
          register: "POST /api/auth/register",
          me: "GET /api/auth/me",
          logout: "POST /api/auth/logout",
        },
        dashboard: {
          stats: "GET /api/dashboard/stats",
          recentOrders: "GET /api/dashboard/recent-orders",
        },
        orders: {
          list: "GET /api/orders?search=&status=&page=&limit=",
          detail: "GET /api/orders/:id",
          create: "POST /api/orders",
          update: "PUT /api/orders/:id",
          updateStatus: "PATCH /api/orders/:id/status",
          delete: "DELETE /api/orders/:id",
        },
        payments: {
          stats: "GET /api/payments/stats",
          list: "GET /api/payments?status=&search=&startDate=&endDate=",
          detail: "GET /api/payments/:id",
          create: "POST /api/payments",
          updateStatus: "PATCH /api/payments/:id/status",
          delete: "DELETE /api/payments/:id",
        },
        transactions: {
          list: "GET /api/transactions?search=&preset=",
          chart: "GET /api/transactions/chart",
        },
        services: {
          stats: "GET /api/services/stats",
          categories: "GET /api/services/categories",
          list: "GET /api/services?category=&activeOnly=",
          detail: "GET /api/services/:id",
          create: "POST /api/services",
          update: "PUT /api/services/:id",
          delete: "DELETE /api/services/:id",
        },
        promos: {
          stats: "GET /api/promos/stats",
          validate: "POST /api/promos/validate",
          list: "GET /api/promos?activeOnly=",
          detail: "GET /api/promos/:id",
          create: "POST /api/promos",
          update: "PUT /api/promos/:id",
          delete: "DELETE /api/promos/:id",
        },
        notifications: {
          list: "GET /api/notifications?status=&search=",
          send: "POST /api/notifications/send",
          delete: "DELETE /api/notifications/:id",
        },
        profile: {
          get: "GET /api/profile",
          update: "PUT /api/profile",
          changePassword: "PUT /api/profile/change-password",
        },
      },
    },
    "SCA Smart Laundry API v1.0.0 Ready"
  );
});

// Mount modules
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/transactions", transactionRoutes);
router.use("/services", serviceRoutes);
router.use("/promos", promoRoutes);
router.use("/notifications", notificationRoutes);
router.use("/profile", profileRoutes);

export default router;
