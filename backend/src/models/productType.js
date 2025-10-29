import mongoose from "mongoose";
import { productTypeConnect } from "../config/productType.js"; // named import

const productTypeSchema = new mongoose.Schema( 
    {
    category: {
      type: String,
      required: true
    },
    productType: {
      type: String,
      required: true
    }
},
        
  
  { timestamps: true }
);

export const productType = productTypeConnect.model("productType", productTypeSchema);
