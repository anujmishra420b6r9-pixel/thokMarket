import mongoose from "mongoose";
import { categoryConnect } from "../config/category.js"; // named import

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Category = categoryConnect.model("category", categorySchema);
