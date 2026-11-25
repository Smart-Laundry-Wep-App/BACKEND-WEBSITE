import { db } from "../models/db.js";
import { successResponse } from "../utils/response.js";

export const getTransactions = (req, res, next) => {
  try {
    const { search = "", preset = "all", startDate, endDate, page = 1, limit = 10 } = req.query;

    const orders = db.findAll("orders");
    const payments = db.findAll("payments");

    // Merge orders with payments into transaction logs
    let transactions = orders.map((order) => {
      const payment = payments.find((p) => p.orderId === order.id);
      return {
        id: `TRX-${order.id.replace("ORD-", "")}`,
        orderId: order.id,
        customer: order.customer,
        service: order.service,
        weight: order.weight,
        amount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus || (payment ? payment.status : "Belum Bayar"),
        paymentMethod: order.paymentMethod || (payment ? payment.method : "Tunai"),
        date: order.createdAt,
      };
    });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.orderId.toLowerCase().includes(q) ||
          t.customer.toLowerCase().includes(q) ||
          t.service.toLowerCase().includes(q)
      );
    }

    const total = transactions.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = transactions.slice(startIndex, startIndex + limitNum);

    return successResponse(
      res,
      {
        transactions: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      },
      "Data riwayat transaksi berhasil dimuat"
    );
  } catch (err) {
    next(err);
  }
};

export const getTransactionChartData = (req, res, next) => {
  try {
    // Standard visual chart points matching frontend curve
    const chartData = {
      labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
      points: [
        { day: "Sen", x: 70, y: 146, value: 450000, orders: 12 },
        { day: "Sel", x: 120, y: 98, value: 720000, orders: 18 },
        { day: "Rab", x: 210, y: 55, value: 1100000, orders: 25 },
        { day: "Kam", x: 330, y: 85, value: 890000, orders: 20 },
        { day: "Jum", x: 465, y: 78, value: 950000, orders: 22 },
        { day: "Sab", x: 630, y: 28, value: 1650000, orders: 36 },
        { day: "Min", x: 770, y: 35, value: 1520000, orders: 34 },
      ],
      svgPath: "M70 146 L120 98 L210 55 L330 85 L465 78 L630 28 L770 35",
      summary: {
        weeklyRevenue: "Rp 7.280.000",
        weeklyOrders: 167,
        highestDay: "Sabtu (Rp 1.650.000)",
      },
    };

    return successResponse(res, chartData, "Data visual grafik transaksi berhasil dimuat");
  } catch (err) {
    next(err);
  }
};
