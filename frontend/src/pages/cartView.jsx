import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";
import { FaTrash, FaArrowLeft, FaShoppingCart, FaCheckCircle } from "react-icons/fa";
import { MdShoppingBag } from "react-icons/md";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const CartView = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🧩 Fetch Cart Data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cartView");
        if (res.data.success) {
          setCartItems(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to load cart");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching cart");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // 🧮 Quantity Change Handler
  const handleQuantityChange = (index, newQty) => {
    const updatedItems = [...cartItems];
    const qty = Number(newQty) || 0;
    updatedItems[index].productQuantity = qty;
    setCartItems(updatedItems);
  };

  // 🧾 Calculate Totals
  const calculateTotal = (price, qty) => Number(price) * Number(qty);
  const grandTotal = cartItems.reduce(
    (acc, item) => acc + calculateTotal(item.productPrice, item.productQuantity),
    0
  );

  // ✅ Confirm Order Handler
  const handleConfirmOrder = async () => {
    for (let item of cartItems) {
      if (item.productQuantity < 5) {
        toast.error(
          `Quantity for "${item.productName}" must be at least 5. Please increase it.`
        );
        return;
      }
    }

    try {
      const res = await api.post("/orderHistory", { items: cartItems });
      if (res.data.success) {
        toast.success(res.data.message || "Order placed successfully!");
        setCartItems([]); // clear cart on frontend
      } else {
        toast.error(res.data.message || "Failed to place order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while placing order");
    }
  };

  // 🗑 Delete Cart Item
  const handleDeleteCartItem = async (cartId) => {
    try {
      const res = await api.delete(`/deleteCartProduct/${cartId}`);
      if (res.data.success) {
        toast.success(res.data.message || "Cart item deleted successfully");
        setCartItems(cartItems.filter((item) => item._id !== cartId));
      } else {
        toast.error(res.data.message || "Failed to delete cart item");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting cart item");
    }
  };

  // 🧭 Loading State
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaShoppingCart className="text-indigo-400 text-2xl animate-pulse" />
            </div>
          </div>
          <p className="text-xl text-gray-700 font-semibold">Loading your cart...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  // 🧭 Error State
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-2 border-red-100">
          <div className="text-red-500 text-7xl mb-4 animate-bounce">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-lg text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  // 🧭 Empty Cart State
  if (!cartItems.length)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border-2 border-blue-100">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <FaShoppingCart className="text-gray-300 text-9xl mx-auto relative" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-8 text-lg">Start adding products to fill your cart!</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 mx-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <FaArrowLeft size={20} /> <span>Continue Shopping</span>
          </button>
        </div>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  // 🧩 Main Cart UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-32 px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-indigo-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-all duration-200 font-semibold px-4 py-2 hover:bg-indigo-50 rounded-xl group"
            >
              <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" /> 
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg">
              <MdShoppingBag size={20} />
              <span className="font-bold text-sm sm:text-base">{cartItems.length} Items</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-lg">
              <FaShoppingCart className="text-white text-2xl sm:text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Review your items before checkout</p>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3 mb-4">
          {cartItems.map((item, index) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-lg p-4 border border-indigo-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <MdShoppingBag className="text-indigo-600 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{item.productName}</h3>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="text-lg font-bold text-indigo-600">
                    ₹{item.productPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1 font-medium">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.productQuantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-full border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl text-center p-2 font-bold outline-none transition-all duration-200"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1 font-medium">Total</label>
                  <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ₹{calculateTotal(item.productPrice, item.productQuantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
                
                <button
                  onClick={() => handleDeleteCartItem(item._id)}
                  className="p-3 text-red-500 hover:text-white hover:bg-gradient-to-r from-red-500 to-red-600 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-500 hover:shadow-lg self-end"
                  title="Remove from cart"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-indigo-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="p-4 text-right text-xs font-bold uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="p-4 text-right text-xs font-bold uppercase tracking-wider">
                    Total
                  </th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartItems.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md">
                          <MdShoppingBag className="text-indigo-600 text-2xl" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{item.productName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-gray-900 font-bold text-lg">
                        ₹{item.productPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <input
                          type="number"
                          min="1"
                          value={item.productQuantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          className="w-24 border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl text-center p-2 font-bold outline-none transition-all duration-200"
                        />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{calculateTotal(item.productPrice, item.productQuantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDeleteCartItem(item._id)}
                          className="p-3 text-red-500 hover:text-white hover:bg-gradient-to-r from-red-500 to-red-600 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-500 hover:shadow-lg"
                          title="Remove from cart"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border-2 border-indigo-100 sticky bottom-20 sm:relative sm:bottom-0">
          <div className="flex flex-col gap-4">
            {/* Summary Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl">
                <span className="text-base sm:text-lg font-semibold text-gray-700">Total Products:</span>
                <span className="font-bold text-xl sm:text-2xl text-indigo-600">{cartItems.length}</span>
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                <span className="text-base sm:text-lg font-semibold text-gray-700">Grand Total:</span>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ₹{grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-800 font-medium flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <span>Minimum order quantity: 5 units per product</span>
                </p>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmOrder}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <FaCheckCircle size={22} />
              <span>Confirm Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navbar (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #818cf8, #a78bfa);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
        }
      `}</style>
    </div>
  );
};

export default CartView;