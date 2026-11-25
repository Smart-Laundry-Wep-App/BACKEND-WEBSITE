import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";
import {
  validateCreateOrder,
  validateUpdateOrder,
} from "../middlewares/order.validator.js";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", validateCreateOrder, createOrder);
router.put("/:id", validateUpdateOrder, updateOrder);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
