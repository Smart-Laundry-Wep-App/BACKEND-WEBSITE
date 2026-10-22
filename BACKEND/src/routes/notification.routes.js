import { Router } from "express";
import {
  getNotifications,
  sendNotification,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", getNotifications);
router.post("/send", sendNotification);
router.post("/", sendNotification);
router.delete("/:id", deleteNotification);

export default router;
