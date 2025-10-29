import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react"; // 👁️ Eye icons

const CreateAdmin = () => {
  const [form, setForm] = useState({
    adminName: "",
    adminAddress: "",
    adminPassword: "",
    adminNumber: "",
    category: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🟢 Fetch all categories on mount
  useEffect(() => {
  (async () => {
    try {
      const res = await api.get("/getAllCategory");
      setCategories(res.data.data || []); // ✅ just like user signup
    } catch (err) {
      console.error("Category fetch failed:", err);
      toast.error("Failed to load categories");
    }
  })();
}, []);


  // 🟠 Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🟣 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/adminSignup", form, { withCredentials: true });
      toast.success(res.data.message || "Admin created successfully");

      // reset form after success
      setForm({
        adminName: "",
        adminAddress: "",
        adminPassword: "",
        adminNumber: "",
        category: "",
      });
    } catch (error) {
      console.error("Signup Error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
      navigate("/MasterHome");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Admin Signup
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-700 mb-1">Admin Name</label>
            <input
              type="text"
              name="adminName"
              value={form.adminName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="Enter admin name"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="adminAddress"
              value={form.adminAddress}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="Enter address"
              required
            />
          </div>

          {/* Number */}
          <div>
            <label className="block text-gray-700 mb-1">Mobile Number</label>
            <input
              type="number"
              name="adminNumber"
              value={form.adminNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="Enter mobile number"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="adminPassword"
              value={form.adminPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Category (Radio Buttons) */}
          <div>
  <label className="block text-gray-700 mb-2">Select Category</label>
  <select
    name="category"
    value={form.category}
    onChange={handleChange}
    className="w-full mb-3 p-2 border rounded-md"
    required
  >
    <option value="">Select Category</option>
    {categories.map((cat) => (
      <option key={cat._id} value={cat.category}>
        {cat.category}
      </option>
    ))}
  </select>
</div>



          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-medium ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } transition`}
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
