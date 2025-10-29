import mongoose from "mongoose";
import { orderHistoryConnect } from "../config/config.orderHistory.js";

const orderHistorySchema = new mongoose.Schema(
  {
    // User info
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userAddress: { type: String, required: true },
    userNumber: { type: String, required: true },
    status:{type: String , require: true},
    // Order items - Multiple products
    items: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        description: { type: String },
        category: { type: String },
        productType: { type: String },
        adminId: { type: String, required: true }
      }
    ],

    // Order status
    orderStatus: { type: String, default: "Pending" }
  },
  { timestamps: true } // createdAt, updatedAt
);

export const modelOrderHistory = orderHistoryConnect.model("OrderHistory", orderHistorySchema);

