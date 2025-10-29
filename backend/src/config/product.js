import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const PRODUCT_URI = process.env.PRODUCT_URI;
if (!PRODUCT_URI) throw new Error("PRODUCT_URI is not defined");

export const productConnect = mongoose.createConnection(PRODUCT_URI);

productConnect.on("connected", () => console.log("✅ product DB connected"));
productConnect.on("error", err => console.error("❌ product DB connection error:", err));
