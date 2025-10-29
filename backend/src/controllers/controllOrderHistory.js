import { modelOrderHistory } from "../models/model.orderHistory.js";
import { Cart } from "../models/cart.js";



export async function updateOrderStatus(req, res) {
  try {
    const orderId = req.params.id; // URL से order ID
    const { status } = req.body;   // body से नया status

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID और Status दोनों जरूरी हैं।",
      });
    }

    // Order ढूंढो
    const order = await modelOrderHistory.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order नहीं मिला।",
      });
    }

    // पुराना status और नया status console में दिखाओ (debug के लिए)
    // console.log(`📝 Order ${orderId} status changed from "${order.status}" to "${status}"`);

    // नया status update करो
    order.status = status;

    // Save करो
    await order.save();

    // Response भेजो
    return res.status(200).json({
      success: true,
      message: "Order status successfully updated.",
      updatedOrder: order,
    });

  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating order status.",
      error: error.message,
    });
  }
}

export async function viewSingleOrder(req, res) {
  try {
    // frontend se query ke through ID mil rahi hai
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // 🟩 Middleware se user info (authenticate se)
    const user = req.user; // { id, name, rank, ... }
    const userRank = user?.rank || "unknown";

    // console.log("Frontend se aayi Order ID:", orderId);
    // console.log("User Rank (middleware se):", userRank);

    // 🟦 Database se order find karo
    const order = await modelOrderHistory.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🟨 Response bhejo — order details + user rank dono ke sath
    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      rank: userRank,
      orderDetails: order,
    });

  } catch (error) {
    console.error("Error in viewSingleOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}



export async function createOrderHistory(req, res) {
  try {
    // ✅ req.user already authenticate middleware से आ रहा है
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. Login first." });
    }

    const data = req.body;

    // ✅ Required fields check for items
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    // ✅ Create order history
    const newOrder = await modelOrderHistory.create({
      userId: user.id,
      userName: user.name,
      userAddress: user.address,
      userNumber: user.number,
      status: "Pending",
      items: data.items.map((item) => ({
        productId: item._id,
        productName: item.productName,
        quantity: item.productQuantity,
        price: item.productPrice,
        description: item.productDescription,
        category: item.category,
        productType: item.productType,
        adminId: item.adminId,
      })),
      orderStatus: "Pending",
    });

    // ✅ Delete user's cart after order is placed
    await Cart.deleteMany({ userId: user.id });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully and cart cleared!",
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Error saving order history:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}
