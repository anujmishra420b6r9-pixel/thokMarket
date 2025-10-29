import { productType } from "../models/productType.js";
import { Product } from "../models/product.js";
import { modelOrderHistory } from "../models/model.orderHistory.js";
import { Cart } from "../models/cart.js";
import {User} from "../models/User.js";
import {Admin} from "../models/admin.js";
import jwt from "jsonwebtoken";


export async function profile(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({ success: false, message: "User data not found." });
    }

    let orders = [];

    // 🟢 अगर User है → userId से उसके ऑर्डर खोजो
    if (user.rank === "user") {
      orders = await modelOrderHistory.find({ userId: user.id }).lean();
    }

    // 🟣 अगर Admin है → items के अंदर adminId से खोजो
    else if (user.rank === "admin") {
      orders = await modelOrderHistory.find({
        "items.adminId": user.id.toString()
      }).lean();
    }

    // अगर कोई ऑर्डर नहीं मिला
    if (!orders.length) {
      return res.status(200).json({
        success: true,
        message: "No orders found for this account.",
        user: {
          id: user.id,
          name: user.name,
          address: user.address,
          number: user.number,
          rank: user.rank,
        },
        orders: [],
      });
    }

    // Orders को summary में convert करो
    const orderSummary = orders.map((order) => {
      const totalProducts = order.items.reduce((acc, item) => acc + item.quantity, 0);
      const totalPrice = order.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

      return {
        _id: order._id,
        totalProducts,
        totalPrice,
        status: order.status,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      };
    });

    // Response भेजो
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        address: user.address,
        number: user.number,
        rank: user.rank,
      },
      orders: orderSummary,
    });

  } catch (error) {
    console.error("🔴 Profile Controller Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch profile." });
  }
}


export async function viewCart(req, res) {
  try {
    // ✅ Check login cookie
    const raw = req.cookies?.userInfo;
    if (!raw) return res.status(401).json({ message: "Please login first" });

    const { id: userId } = JSON.parse(raw);
    if (!userId) return res.status(400).json({ message: "Invalid user data in cookie" });

    // ✅ Fetch all cart items for this user
    const products = await Cart.find({ userId });

    if (!products.length) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // ✅ Success response
    return res.status(200).json({
      message: `✅ Found ${products.length} product(s) in the cart`,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("❌ Error fetching cart:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}


export async function viewOrderHistory(req, res) {
  try {
    // ✅ Check login cookie
    const raw = req.cookies?.userInfo;
    if (!raw) return res.status(401).json({ message: "Please login first" });

    const { id, role } = JSON.parse(raw);
    if (!id || !role) return res.status(400).json({ message: "Invalid user data in cookie" });

    // ✅ Determine query based on role
    const query =
      role === "admin" ? { ordProAdminId: id } : { ordProUserId: id };

    const orders = await orderHistory.find(query);

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    // ✅ Success response
    return res.status(200).json({
      message: `✅ Found ${orders.length} order(s) for ${role}`,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("❌ Error fetching order history:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}


export async function singleProduct(req, res) {
  try {
    const { id } = req.params; // productId from URL

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required in params.",
      });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("🔴 Single Product Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
}


export const productWithProductType = async (req, res) => {
  try {
    const { productType } = req.params; // URL से productType निकालो

    if (!productType) {
      return res.status(400).json({
        success: false,
        message: "Product type is required",
      });
    }

    // MongoDB से सारे products निकालो जिनका productType match करता हो
    const products = await Product.find({ productType: productType.trim() });

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No products found for this type",
      });
    }

    // अगर products मिले तो frontend को भेज दो
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products by type:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export async function homePage(req, res) {
  try {
    // ✅ Step 1: Get user data from middleware (authenticate middleware already ran)
    const userCategory = req.user?.category;

    if (!userCategory) {
      return res.status(400).json({
        success: false,
        message: "User category not found."
      });
    }

    // ✅ Step 2: Find all productTypes matching user's category
    const matchingProducts = await productType
      .find({ category: userCategory })
      .select("_id productType category") // sirf required fields
      .lean();

    // ✅ Step 3: Check if products found
    if (!matchingProducts || matchingProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products found for your category.",
        data: {
          user: {
            id: req.user.id,
            name: req.user.name,
            category: req.user.category,
            rank: req.user.rank
          },
          products: []
        }
      });
    }

    // ✅ Step 4: Prepare response with user info and matching products
    const responseData = {
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          category: req.user.category,
          rank: req.user.rank
        },
        products: matchingProducts.map(product => ({
          id: product._id,
          productType: product.productType,
          category: product.category
        })),
        totalProducts: matchingProducts.length
      }
    };

    // ✅ Step 5: Send success response
    return res.status(200).json(responseData);

  } catch (error) {
    // ✅ Step 6: Error handling
    console.error("❌ HomePage Error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Database connection error
    if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
      return res.status(503).json({
        success: false,
        message: "Database connection failed. Please try again later."
      });
    }

    // Invalid query error
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid query format."
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please contact support."
    });
  }
}

