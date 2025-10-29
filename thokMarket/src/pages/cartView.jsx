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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your cart...</p>
        </div>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  // 🧭 Error State
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 font-semibold">{error}</p>
        </div>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  // 🧭 Empty Cart State
  if (!cartItems.length)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full">
          <div className="mb-6">
            <FaShoppingCart className="text-gray-300 text-8xl mx-auto mb-4" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaArrowLeft /> <span>Continue Shopping</span>
          </button>
        </div>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  // 🧩 Main Cart UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pb-24 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaArrowLeft size={18} /> <span>Back to Shopping</span>
            </button>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <MdShoppingBag className="text-blue-600" size={20} />
              <span className="text-blue-600 font-semibold">{cartItems.length} Items</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <FaShoppingCart className="text-blue-600 text-3xl" />
            <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
          </div>
        </div>

        {/* Cart Items Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartItems.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <MdShoppingBag className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                          {/* <p className="text-xs text-gray-500">
                            Added on: {new Date(item.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p> */}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-gray-900 font-semibold">
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
                          className="w-20 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-center p-2 font-semibold outline-none transition-all duration-200"
                        />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{calculateTotal(item.productPrice, item.productQuantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDeleteCartItem(item._id)}
                          className="p-2.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 border-2 border-red-200 hover:border-red-500"
                          title="Remove from cart"
                        >
                          <FaTrash size={16} />
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
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Left: Summary */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3 text-gray-600">
                <span className="text-lg">Total Products:</span>
                <span className="font-bold text-xl text-gray-900">{cartItems.length}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg text-gray-600">Grand Total:</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  ₹{grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span>💡</span>
                <span>Minimum order quantity: 5 units per product</span>
              </p>
            </div>

            {/* Right: Confirm Button */}
            <div>
              <button
                onClick={handleConfirmOrder}
                className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaCheckCircle size={22} />
                <span>Confirm Order</span>
              </button>
            </div>
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
          background: #cbd5e1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default CartView;