import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Admin } from "../models/admin.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.userToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. Please login." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Invalid token. Please login again."
      });
    }

    const userId = decoded.id || decoded._id;
    const userRank = decoded.rank;

    if (!userId || !userRank) {
      return res.status(400).json({ success: false, message: "Invalid token data." });
    }

    let userData;

    if (userRank === "admin") {
      userData = await Admin.findById(userId).lean();
      if (!userData) return res.status(404).json({ success: false, message: "Admin not found." });

      req.user = {
        id: userData._id,
        name: userData.adminName,
        address: userData.adminAddress,
        category: userData.category,
        number: userData.adminNumber,
        rank: userData.rank,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    } else {
      userData = await User.findById(userId).select("-password").lean();
      if (!userData) return res.status(404).json({ success: false, message: "User not found." });

      req.user = {
        id: userData._id,
        name: userData.name,
        address: userData.address,
        category: userData.category,
        number: userData.number,
        rank: userData.rank,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    }

    next();
  } catch (error) {
    console.error("🔴 Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Authentication failed." });
  }
};
