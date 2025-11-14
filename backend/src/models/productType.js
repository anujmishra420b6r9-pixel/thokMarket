import mongoose from "mongoose";
import { productTypeConnect } from "../config/productType.js"; 

const productTypeSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true
    },
    productType: {
      type: String,
      required: true
    },
    image: {
      type: String, // Cloudinary URL
      required: true
    }
  },
  { timestamps: true }
);

export const productType = productTypeConnect.model("productType", productTypeSchema);
