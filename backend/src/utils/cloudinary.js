import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import fs from "fs/promises"; // Async fs

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "products",
    });

    // console.log("✅ Cloudinary upload success:", response.secure_url);

    // ✅ Async delete file
    try {
      await fs.unlink(localFilePath);
      // console.log("🗑️ Temp file deleted:", localFilePath);
    } catch (err) {
      console.error("❌ Failed to delete temp file:", localFilePath, err.message);
    }

    return response;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error.message);
    try { await fs.unlink(localFilePath); } catch (err) {}
    return null;
  }
};

