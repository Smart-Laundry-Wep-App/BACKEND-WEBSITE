import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/profile.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", optionalAuth, getProfile);
router.put("/", optionalAuth, updateProfile);
router.put("/change-password", optionalAuth, changePassword);

export default router;
