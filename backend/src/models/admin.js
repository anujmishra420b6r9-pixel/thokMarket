import mongoose from "mongoose";
import { adminConnect} from "../config/admin.js";



const createAdminSchema = new mongoose.Schema(
    {
        adminName: {
            type: String,
            required: true,
        },
        adminAddress: {
            type: String,
            required: true,
        },
        adminPassword: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        adminNumber: {
            type: Number,
            required: true,
        },
        rank: {
            type: String,
            required: true,
        },
    },
    { timestamps: true } // createdAT , updatedAt
);



export const Admin = adminConnect.model("Admin", createAdminSchema);


