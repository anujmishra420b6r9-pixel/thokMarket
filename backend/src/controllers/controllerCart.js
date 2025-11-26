import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";
import { User } from "../models/User.js";
import { Admin } from "../models/admin.js";

export async function cart(req, res) {
  try {
    const { productId, quantity } = req.body;

    // 1️⃣ Validate incoming data
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required.",
      });
    }

    if (quantity < 5) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 5.",
      });
    }

    // 2️⃣ Fetch product details from DB
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // 3️⃣ Check if product already exists in cart for this user
    const existingCartItem = await Cart.findOne({
      productId: product._id.toString(),
      userId: req.user.id.toString(),
    });

    // 4️⃣ If exists → update quantity only
    if (existingCartItem) {
      existingCartItem.productQuantity = quantity; // new quantity replace previous
      await existingCartItem.save();

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully.",
        data: existingCartItem,
      });
    }

    // 5️⃣ If NOT exists → create new cart item
    const cartData = {
      productName: product.productName,
      productId: product._id.toString(),
      productPrice: product.productPrice,
      productDescription: product.productDescription,
      category: product.category,
      productType: product.productType,
      productQuantity: quantity,
      adminId: product.adminId.toString(),
      userId: req.user.id.toString(),
      userName: req.user.name,
    };

    const newCart = await Cart.create(cartData);

    return res.status(201).json({
      success: true,
      message: "Product added to cart successfully.",
      data: newCart,
    });

  } catch (error) {
    console.error("🔴 Cart Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart.",
    });
  }
}



export async function deleteCartProduct(req, res) {
  try {
    const { cartId } = req.params; // 🟢 frontend se cartId aayegi (e.g. /cart/:cartId)

    if (!cartId) {
      return res.status(400).json({ success: false, message: "Cart ID is required" });
    }

    // 🔹 Check if cart product exists
    const existingCart = await Cart.findById(cartId);
    if (!existingCart) {
      return res.status(404).json({ success: false, message: "Cart product not found" });
    }

    // 🔹 Delete the cart product
    await Cart.findByIdAndDelete(cartId);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting cart product:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting cart product",
      error: error.message,
    });
  }
}









export async function cartView(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in request."
      });
    }

    // ✅ सही query (हर product अलग document है)
    const cart = await Cart.find({ userId: userId }).lean();

    if (!cart || cart.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Cart is empty."
      });
    }

    // ✅ अब पूरा cart भेज दो frontend को
    return res.status(200).json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error("🔴 cartView Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart."
    });
  }
}

