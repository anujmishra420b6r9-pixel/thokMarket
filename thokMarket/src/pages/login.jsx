import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // 👀 Icons

const Login = () => {
  const [form, setForm] = useState({
    number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // 🔹 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { number, password } = form;
    if (!number || !password) {
      return toast.warn("Please fill all fields");
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/login",
        { number, password },
        { withCredentials: true }
      );

      toast.success(res.data?.message || "Login successful");

      // ✅ Redirect based on role
      if (res.data.role === "master") navigate("/MasterHome");
      // else if (res.data.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          User Login
        </h1>

        {/* 🔹 Number Input */}
        <input
          type="number"
          name="number"
          placeholder="Phone Number"
          value={form.number}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded-md"
        />

        {/* 🔹 Password Input with Toggle */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* 🔹 Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl shadow-md transition-all duration-300 font-semibold ${
              loading
                ? "opacity-80 cursor-not-allowed"
                : "hover:bg-blue-700 hover:shadow-lg"
            }`}
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl border border-gray-300 shadow-sm hover:bg-gray-200 hover:shadow-md transition-all duration-300 font-semibold"
          >
            Don’t have an account? Signup
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
