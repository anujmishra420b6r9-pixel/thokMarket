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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 text-base font-medium">Loading...</p>
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
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">User Not Found</h2>
          <p className="text-gray-600 text-sm">User data could not be loaded.</p>
        </div>
      </div>
    );
  }

  // =================================================================
  // ✅ Main Profile UI - Mobile Optimized
  // =================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-6 pb-8 px-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">ThokMarket</h1>
            <p className="text-indigo-100 text-xs mt-1">
              {user.rank === "admin" ? "Admin Panel" : "Your Account"}
            </p>
          </div>
          {user.rank === "admin" && (
            <button
              onClick={() => navigate("/createProduct")}
              className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow-md text-sm hover:bg-indigo-50"
            >
              + Product
            </button>
          )}
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
              <p className="text-xs text-gray-500">
                {user.rank === "admin" ? "🛡️ Admin" : "👤 User"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10h3m10-11l2 2v10h-3m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Address</p>
                <p className="text-sm text-gray-800 font-semibold break-words">{user.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.49 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.49a1 1 0 01.68.95V19a2 2 0 01-2 2H19C9.72 21 3 14.28 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="text-sm text-gray-800 font-semibold">{user.number}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">
            {user.rank === "admin" ? "📦 Received Orders" : "🛍️ My Orders"}
          </h3>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
            {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-3">📭</div>
            <p className="text-gray-600 font-medium">No Orders Yet</p>
            <p className="text-gray-400 text-sm mt-1">Your orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <div
                key={order._id}
                onClick={() => handleViewSingleOrder(order._id)}
                className="bg-white rounded-xl shadow-md p-4 active:scale-98 transition-transform"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <span className="text-xs text-gray-600">{user.number}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(user.number);
                        toast.success("Number copied!");
                      }}
                      className="text-indigo-600 text-xs border border-indigo-300 px-2 py-0.5 rounded hover:bg-indigo-50"
                    >
                      📋
                    </button>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Products</p>
                      <p className="text-lg font-bold text-gray-800">{order.totalProducts}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-green-600">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Bottom Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <Navbar />
      </div>
    </div>
  );
};

export default Profile;