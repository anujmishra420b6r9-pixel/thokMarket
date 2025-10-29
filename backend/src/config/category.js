import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const CATEGORY_URI = process.env.CATEGORY_URI;
if (!CATEGORY_URI) throw new Error("CATEGORY_URI is not defined");

export const categoryConnect = mongoose.createConnection(CATEGORY_URI);

categoryConnect.on("connected", () => console.log("✅ Category DB connected"));
categoryConnect.on("error", err => console.error("❌ Category DB connection error:", err));
