import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const CART_URI = process.env.CART_URI;

if (!CART_URI) throw new Error("CART_URI is not defined");

export const cartConnect = mongoose.createConnection(CART_URI);

cartConnect.on("connected", () => console.log("✅ Cart DB connected"));
cartConnect.on("error", err => console.error("❌ Cart DB connection error:", err));
