import { Product } from "../models/product.js";
import { User } from "../models/User.js";
import { Admin } from "../models/admin.js";

export const checkCreator = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required in params.",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // 🔍 DEBUG: Console में print करो
    // console.log("🟢 Logged In User ID:", loggedInUser.id);
    // console.log("🟢 Logged In User ID Type:", typeof loggedInUser.id);
    // console.log("🟡 Product Admin ID:", product.adminId);
    // console.log("🟡 Product Admin ID Type:", typeof product.adminId);

    // ✅ IMPORTANT: दोनों को string में convert करके compare करो
    const loggedInUserId = loggedInUser.id.toString();
    const productAdminId = product.adminId.toString();

    // console.log("🔵 After toString - User ID:", loggedInUserId);
    // console.log("🔵 After toString - Admin ID:", productAdminId);
    // console.log("🔵 Are they equal?:", loggedInUserId === productAdminId);

    const isCreator = loggedInUser.rank === "admin";

    // ✅ अगर creator है तो उसका नाम भी भेजो
    let creatorName = null;
    if (isCreator) {
      creatorName = loggedInUser.name;
    }

    return res.status(200).json({
      success: true,
      isCreator: isCreator,
      role: isCreator ? "creator" : "user",
      message: isCreator
        ? "You are the creator of this product."
        : "You are not the creator of this product.",
      creatorName: creatorName,
      product: {
        id: product._id,
        name: product.productName,
        adminId: product.adminId,
      },
      user: {
        id: loggedInUser.id,
        name: loggedInUser.name,
      },
    });
  } catch (error) {
    console.error("🔴 checkCreator Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while verifying creator.",
    });
  }
};