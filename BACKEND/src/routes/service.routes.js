import { Router } from "express";
import {
  getServices,
  getServiceStats,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getCategories,
} from "../controllers/service.controller.js";

const router = Router();

router.get("/stats", getServiceStats);
router.get("/categories", getCategories);
router.get("/", getServices);
router.get("/:id", getServiceById);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
