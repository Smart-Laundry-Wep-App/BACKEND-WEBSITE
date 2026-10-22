import { Router } from "express";
import {
  getPromos,
  getPromoStats,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  validatePromo,
} from "../controllers/promo.controller.js";

const router = Router();

router.get("/stats", getPromoStats);
router.post("/validate", validatePromo);
router.get("/", getPromos);
router.get("/:id", getPromoById);
router.post("/", createPromo);
router.put("/:id", updatePromo);
router.delete("/:id", deletePromo);

export default router;
