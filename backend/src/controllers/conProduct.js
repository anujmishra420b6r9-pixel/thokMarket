import { Product } from "../models/product.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ✅ Update Product Controller
export const updateProduct = async (req, res) => {
  try {
    const { productId, productName, productPrice, productDescription } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (productName) product.productName = productName;
    if (productPrice) product.productPrice = productPrice;
    if (productDescription) product.productDescription = productDescription;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      data: product,
    });
  } catch (err) {
    console.error("❌ Update Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};






export async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;

    // 🟡 Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // 🔹 Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔹 Delete images from Cloudinary
    const imageUrls = [product.productFile1, product.productFile2, product.productFile3];

    for (const url of imageUrls) {
      if (url) {
        try {
          // ✅ Extract public_id properly
          // Example: https://res.cloudinary.com/demo/image/upload/v1730123456/folder/image123.jpg
          // Result: folder/image123
          const parts = url.split("/upload/");
          const publicIdWithExt = parts[1].split(".")[0]; // remove .jpg or .png etc.
          const publicId = publicIdWithExt.replace(/^v[0-9]+\//, ""); // remove version (v12345)

          // ✅ Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`🗑️ Deleted from Cloudinary: ${publicId}`, result);
        } catch (err) {
          console.error(`⚠️ Error deleting image from Cloudinary:`, err.message);
        }
      }
    }

    // 🔹 Delete product from database
    await Product.findByIdAndDelete(productId);

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: "✅ Product and its Cloudinary images deleted successfully",
    });

  } catch (error) {
    console.error("❌ Error deleting product:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting product",
      error: error.message,
    });
  }
}

export const productCreate = async (req, res) => {
  try {
    // ✅ Check token
    const token = req.cookies?.userToken;

    // ✅ Decode token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    if (decoded.rank !== "admin") {
      return res.status(403).json({ message: "Only admin can create" });
    }

    // ✅ Destructure form data
    const { productName, productPrice, productDescription, category, productType } = req.body;

    if (!productName || !productPrice || !productDescription || !category || !productType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check files
    if (!req.files || !req.files.productFiles) {
      return res.status(400).json({ message: "Product images are required" });
    }

    // ✅ Ensure files is always an array
    const files = Array.isArray(req.files.productFiles)
      ? req.files.productFiles
      : [req.files.productFiles];

    // ✅ Upload images to Cloudinary
    const uploadedImages = [];
    for (const file of files) {
      const result = await uploadOnCloudinary(file.path);
      if (result?.secure_url) uploadedImages.push(result.secure_url);
    }

    if (uploadedImages.length < 3) {
      return res.status(400).json({ message: "3 product images required" });
    }

    // ✅ Save product in DB
    const newProduct = await Product.create({
      productName,
      productPrice,
      productDescription,
      category,
      productType,
      adminId: decoded.id,
      productFile1: uploadedImages[0],
      productFile2: uploadedImages[1],
      productFile3: uploadedImages[2],
    });
    console.log("🟢 Product Created By:", req.user.id);
    return res.status(201).json({
      message: "✅ Product created successfully",
      product: newProduct,
    });
    
  } catch (error) {
    console.error("❌ Error creating product:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



