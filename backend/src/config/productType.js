import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const PRODUCT_TYPE_URI = process.env.PRODUCT_TYPE_URI;
if (!PRODUCT_TYPE_URI) throw new Error("PRODUCT_TYPE_URI is not defined");

export const productTypeConnect = mongoose.createConnection(PRODUCT_TYPE_URI);

productTypeConnect.on("connected", () => console.log("✅ ProductType DB connected"));
productTypeConnect.on("error", err => console.error("❌ ProductType DB connection error:", err));
