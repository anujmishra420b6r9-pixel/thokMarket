import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const ORDER_HISTORY_URI = process.env.ORDER_HISTORY_URI;

if (!ORDER_HISTORY_URI) throw new Error("ORDER_HISTORY_URI is not defined");

export const orderHistoryConnect = mongoose.createConnection(ORDER_HISTORY_URI);

orderHistoryConnect.on("connected", () => console.log("✅ orderHistory DB connected"));
orderHistoryConnect.on("error", err => console.error("❌ orderHistory DB connection error:", err));
