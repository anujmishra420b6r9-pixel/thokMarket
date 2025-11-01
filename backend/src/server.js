// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"

import { userConnect } from "./config/user.js";
import { adminConnect } from "./config/admin.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname=path.resolve()
const app = express();
app.use(express.json());



app.use(
  cors({
    origin: ["https://thokmarket-frontend.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);




app.use(cookieParser());

// console.log("DB connections imported");
app.use("/api", authRoutes);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});


// global error handler (simple)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
