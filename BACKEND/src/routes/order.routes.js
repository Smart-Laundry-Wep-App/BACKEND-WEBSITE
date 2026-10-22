import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
