// models/User.js
import mongoose from "mongoose";
import { userConnect } from "../config/user.js"; // connection import

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    category: { type: String, required: true },
    number: { type: Number, required: true },
    rank: { type: String, required: true },
  },
  { timestamps: true }
);

// ⚡ use connection.model() instead of mongoose.model()
export const User = userConnect.model("User", userSchema);
