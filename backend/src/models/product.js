

import mongoose from "mongoose";
import { productConnect } from "../config/product.js"; // named import

const productSchema = new mongoose.Schema(
  {
        productName: {
            type: String,
            required: true,
        },
        productPrice: {
            type: Number,
            required: true,
        },
        productDescription: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        productType: {
            type: String,
            required: true,
        },
        adminId : {
            type: String,
            required: true,
        },
        productFile1: {
            type: String,
            required: true,
        },
        productFile2: {
            type: String,
            required: true,
        },
        productFile3: {
            type: String,
            required: true,
        },
},
  { timestamps: true }
);

export const Product = productConnect.model("Product", productSchema);












