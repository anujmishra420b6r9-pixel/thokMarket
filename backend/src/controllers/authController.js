// controllers/authController.js
import dotenv from "dotenv";


dotenv.config();

import bcrypt from "bcryptjs";
import {User} from "../models/User.js";
import {Admin} from "../models/admin.js";
import jwt from "jsonwebtoken";


const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d", // 1 month
  });
};

// ✅ Login Controller
export const login = async (req, res) => {
  try {
    const { number, password } = req.body;

    // 🔹 Step 1: Validate Input
    if (!number || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and password are required",
      });
    }

    // 🔹 Step 2: Check MASTER LOGIN
    if (
      number === process.env.MASTER_NUMBER &&
      password === process.env.MASTER_PASSWORD
    ) {
      const token = generateToken({
        id: "master",
        rank: "master",
      });

      res.cookie("userToken", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 1 month
        sameSite: "lax", // Changed from strict for development
        secure: false, // Set to true in production with HTTPS
      });

      console.log("✅ Master login successful");

      return res.status(200).json({
        success: true,
        message: "Master login successful",
        rank: "master",
        token, // Optional: send token in response too
      });
    }

    // 🔹 Step 3: Check ADMIN LOGIN
    const admin = await Admin.findOne({ adminNumber: Number(number) }).select("+adminPassword");
    if(!admin)console.log("admin not found")
    if (admin) {
      const isPasswordMatch = await bcrypt.compare(password, admin.adminPassword);

      if (isPasswordMatch) {
        const token = generateToken({
          id: admin._id.toString(),
          rank: "admin",
          category: admin.category, // Include category if needed
          name: admin.name,
        });

        res.cookie("userToken", token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 1 month
          sameSite: "lax",
          secure: false, // Set to true in production
        });

        return res.status(200).json({
          success: true,
          message: "Admin login successful",
          rank: "admin",
          adminId: admin._id,
          name: admin.name,
          category: admin.category,
          token,
        });
      }
    }

    // 🔹 Step 4: Check USER LOGIN
    const user = await User.findOne({ number: String(number) }).select("+password");

    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (isPasswordMatch) {
        const token = generateToken({
          id: user._id.toString(),
          rank: "user",
          name: user.name,
        });

        res.cookie("userToken", token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 1 month
          sameSite: "lax",
          secure: false, // Set to true in production
        });
        return res.status(200).json({
          success: true,
          message: "User login successful",
          rank: "user",
          userId: user._id,
          name: user.name,
          token,
        });
      }
    }

    // 🔹 Step 5: User Not Found or Wrong Password
    console.log("❌ Login failed: Invalid credentials");

    return res.status(401).json({
      success: false,
      message: "Invalid phone number or password",
    });

  } catch (error) {
    console.error("❌ Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};



export async function updateProfile(req, res) {
  try {

    // 🔹 2️⃣ Frontend से नया डेटा लेना
    const updatedData = req.body;
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ success: false, message: "No data provided for update" });
    }

    // 🔹 3️⃣ Role के अनुसार मॉडल से यूज़र ढूंढना
    let Model;
    if (role === "admin") Model = Admin;
    else if (role === "user") Model = User;
    else return res.status(400).json({ success: false, message: "Invalid role" });

    // 🔹 4️⃣ डेटा अपडेट करना (और नया डेटा वापस भेजना)
    const updatedProfile = await Model.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔹 5️⃣ Success Response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}


export async function adminSignup(req, res) {
  try {
    const {
      adminName,
      adminAddress,
      adminPassword,
      category,
      adminNumber
    } = req.body;

    // 🧩 Validate
    if (!adminName || !adminAddress || !adminPassword || !category || !adminNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔍 Check existing by number
    const existing = await Admin.findOne({ adminNumber });
    if (existing) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    // 🔐 Hash password
    const hashed = await bcrypt.hash(adminPassword, 10);

    // 🆕 Create new admin
    const newAdmin = await Admin.create({
      adminName,
      adminAddress,
      adminPassword: hashed,
      category,
      adminNumber,
      rank: "admin",
    })

    // ✅ Response
    return res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        adminName: newAdmin.adminName,
        adminNumber: newAdmin.adminNumber,
        rank: newAdmin.rank,
      },
    });
  } catch (err) {
    console.error("adminSignup error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}


export async function userSignup(req, res) {
  try {
    const { name, address, password, category, number } = req.body;

    // 🔹 1. Validate all required fields
    if (!name || !address || !password || !category || !number) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 🔹 2. Check if user already exists
    const existingUser = await User.findOne({ number });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // 🔹 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 4. Create new user
    const newUser = new User({
      name,
      address,
      password: hashedPassword,
      category,
      number,
      rank: "user", // Default rank
    });

    const savedUser = await newUser.save();

    // 🔹 5. Generate JWT Token
    const token = jwt.sign(
      { id: savedUser._id, rank: savedUser.rank },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "30d" }
    );

    // 🔹 6. Set JWT in cookies
    res.cookie("userToken", token, {
      httpOnly: true, // prevent client-side JS access
      secure: false, // set true if HTTPS
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 1 month
    });

    // 🔹 7. Send success response
    return res.status(201).json({
      message: "Signup successful!",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        number: savedUser.number,
        category: savedUser.category,
        rank: savedUser.rank,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
}


export async function logout(req, res) {
  try {
    // 1️⃣ Clear the cookie
    res.clearCookie("userInfo", {
      httpOnly: true,
      secure: false,       // production में true कर देना
      sameSite: "strict",
      path: "/",           // cookie path clear करना ज़रूरी है
    });


    // 3️⃣ Send response
    res.status(200).json({
      message: "Logout successful",
      loggedOut: true
    });

  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      message: "Internal Server Error during logout",
      error: error.message
    });
  }
}



export const me = async (req, res) => {
  try {
    // 🔹 Middleware से attach किया गया user
    const user = req.user;

    // 🔹 अगर middleware ने कोई user attach नहीं किया → guest
    if (!user) {
      return res.status(200).json({ rank: "guest" });
    }

    // 🔹 Master user handle
    if (user.rank === "master" || user.id === "master") {
      return res.status(200).json({
        id: "master",
        rank: "master",
        name: "Master User",
        number: process.env.MASTER_NUMBER || null,
      });
    }

    // 🔹 Admin handle
    if (user.rank === "admin") {
      return res.status(200).json({
        id: user.id,
        rank: "admin",
        name: user.name,
        number: user.number,
        address: user.address,
        category: user.category,
      });
    }

    // 🔹 Normal user handle
    return res.status(200).json({
      id: user.id,
      rank: user.rank || "user",
      name: user.name,
      number: user.number,
      address: user.address,
      category: user.category,
    });
  } catch (error) {
    console.error("❌ Me API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};