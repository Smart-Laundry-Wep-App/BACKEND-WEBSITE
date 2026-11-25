import { Router } from "express";
import { getTransactions, getTransactionChartData } from "../controllers/transaction.controller.js";

const router = Router();

router.get("/chart", getTransactionChartData);
router.get("/", getTransactions);

export default router;
