// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const USER_URI = process.env.USER_URI;

if (!USER_URI) throw new Error("USER_URI is not defined");

export const userConnect = mongoose.createConnection(USER_URI);

userConnect.on("connected", () => console.log("✅ User DB connected"));
userConnect.on("error", err => console.error("❌ User DB connection error:", err));
