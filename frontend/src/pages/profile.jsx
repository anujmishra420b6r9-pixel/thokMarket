import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // =================================================================
  // ✅ Fetch Profile Data
  // =================================================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        if (res.data.success) {
          let fetchedOrders = [...res.data.orders].reverse(); // Latest first

          // ✅ अगर Admin है तो Cancel या Delivered orders हटाओ
        if (res.data.user.rank === "admin") {
          fetchedOrders = fetchedOrders.filter((order) => {
          const status = order.status.toLowerCase();
          return !(
          status.includes("cancel") || 
          status.includes("delivered")
          );
        });
      }
          setUser(res.data.user);
          setOrders(fetchedOrders);
        } else {
          toast.error(res.data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // =================================================================
  // ✅ Handle View Single Order
  // =================================================================
  const handleViewSingleOrder = async (orderId) => {
    try {
      const res = await api.get(`/viewSingleOrder`, { params: { orderId } });
      if (res.data.success) {
        navigate(`/SingleOrderPage?orderId=${orderId}`);
      } else {
        toast.error(res.data.message || "Failed to fetch order details");
      }
    } catch (err) {
      console.error("handleViewSingleOrder error:", err);
      toast.error("Something went wrong while viewing order");
    }
  };

  // =================================================================
  // ✅ Loading State
  // =================================================================
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 text-lg font-medium animate-pulse">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // =================================================================
  // ✅ User Not Found
  // =================================================================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600">User data could not be loaded.</p>
        </div>
      </div>
    );
  }

  // =================================================================
  // ✅ Main Profile UI
  // =================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-indigo-600 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              𝑊𝑒𝑙𝑐𝑜𝑚𝑒 𝑇𝑜 ThokMarket
            </h1>
            <p className="text-gray-600 mt-2">
              {user.rank === "admin"
                ? "Manage your incoming orders and view your shop stats"
                : "Manage your account and view your orders"}
            </p>
          </div>

          {/* ✅ Create Product Button for Admin */}
          {user.rank === "admin" && (
            <button
              onClick={() => navigate("/createProduct")}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
              Create Product
            </button>
          )}
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-10 h-10 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-indigo-100">
                  {user.rank === "admin" ? "Admin Account" : "User Account"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10h3m10-11l2 2v10h-3m-6 0h6"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Address</p>
                <p className="text-gray-800 font-semibold">{user.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.49 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.49a1 1 0 01.68.95V19a2 2 0 01-2 2H19C9.72 21 3 14.28 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="text-gray-800 font-semibold">{user.number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {user.rank === "admin" ? "Received Orders" : "Order History"}
              </h3>
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                {orders.length} Total
              </span>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            {orders.length === 0 ? (
              <p className="text-center text-gray-600 py-6">
                No Orders Found 😔
              </p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="px-6 py-3 text-left">Order ID</th>
                    <th className="px-6 py-3 text-center">Products</th>
                    <th className="px-6 py-3 text-center">Total Price</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, index) => (
                  <tr
                  key={order._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewSingleOrder(order._id)}
                >
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                    #{index + 1} — {user.number}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(user.number);
                      toast.success("Number copied!");
                  }}
                      className="ml-2 text-indigo-600 text-[10px] border border-indigo-400 px-2 py-[2px] rounded hover:bg-indigo-50"
                  >
                    📋 Copy
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">{order.totalProducts}</td>
                    <td className="px-6 py-4 text-center font-semibold text-green-600">
                ₹{order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-bold ${
                    order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                     : "bg-green-100 text-green-800"
                     }`}
                >
                  {order.status}
                </span>
                  </td>
                  </tr>
                ))}
              </tbody>

              </table>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full z-50">
        <Navbar />
      </div>
    </div>
  );
};

export default Profile;
