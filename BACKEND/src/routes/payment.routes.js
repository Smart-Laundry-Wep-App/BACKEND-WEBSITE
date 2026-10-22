import { Router } from "express";
import {
  getPayments,
  getPaymentStats,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.get("/stats", getPaymentStats);
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.patch("/:id/status", updatePaymentStatus);
router.delete("/:id", deletePayment);

export default router;
