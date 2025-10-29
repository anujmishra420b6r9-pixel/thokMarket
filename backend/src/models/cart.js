

import mongoose from "mongoose";
import { cartConnect} from "../config/config.cart.js";



const createCartSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
        },
        productId: {
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
        productQuantity: {
            type: Number,
            required: true,
        },
        adminId : {
            type: String,
            required: true,
        },    
        userId: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
    },
    { timestamps: true } // createdAT , updatedAt
);



export const Cart = cartConnect.model("Cart", createCartSchema);













