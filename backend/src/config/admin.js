import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_URI = process.env.ADMIN_URI;

if (!ADMIN_URI) throw new Error("ADMIN_URI is not defined");

export const adminConnect = mongoose.createConnection(ADMIN_URI);

adminConnect.on("connected", () => console.log("✅ Admin DB connected"));
adminConnect.on("error", err => console.error("❌ Admin DB connection error:", err));




// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();

// const ADMIN_URI = process.env.ADMIN_URI;

// export async function connectAdmin() {
//   if (!ADMIN_URI) {
//     throw new Error("ADMIN_URI is not defined in .env");
//   }

//   try {
//     await mongoose.createConnection(ADMIN_URI, {
//       // mongoose 7+ default options are fine; keep this simple
//     });
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB connection error:", err.message);
//     throw err;
//   }
// }


// config/db.js