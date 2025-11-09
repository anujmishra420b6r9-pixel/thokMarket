import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";
import {
  FaTrash,
  FaArrowLeft,
  FaShoppingCart,
  FaCheckCircle,
} from "react-icons/fa";
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

  const handleQuantityChange = (index, newQty) => {
    const updated = [...cartItems];
    const qty = Number(newQty) || 0;
    updated[index].productQuantity = qty;
    setCartItems(updated);
  };

  const calculateTotal = (price, qty) => Number(price) * Number(qty);
  const grandTotal = cartItems.reduce(
    (acc, item) => acc + calculateTotal(item.productPrice, item.productQuantity),
    0
  );

  const handleConfirmOrder = async () => {
    for (let item of cartItems) {
      if (item.productQuantity < 5) {
        toast.error(`"${item.productName}" की quantity कम से कम 5 होनी चाहिए`);
        return;
      }
    }

    try {
      const res = await api.post("/orderHistory", { items: cartItems });
      if (res.data.success) {
        toast.success("ऑर्डर सफलतापूर्वक कन्फर्म हुआ!");
        setCartItems([]);
      } else toast.error("ऑर्डर कन्फर्म करने में समस्या हुई");
    } catch (err) {
      toast.error("कुछ गड़बड़ हो गई");
    }
  };

  const handleDeleteCartItem = async (id) => {
    try {
      const res = await api.delete(`/deleteCartProduct/${id}`);
      if (res.data.success) {
        toast.success("सामान हटाया गया");
        setCartItems(cartItems.filter((item) => item._id !== id));
      } else toast.error("हटाने में समस्या हुई");
    } catch (err) {
      toast.error("Error deleting cart item");
    }
  };

  // Loading State
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-semibold">लोड हो रहा है...</p>
        </div>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  // Error State
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg">
          <p className="text-red-600 font-semibold mb-2">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Reload
          </button>
        </div>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  // Empty Cart
  if (!cartItems.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <FaShoppingCart className="text-7xl text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold text-amber-800 mb-2">
          आपका कार्ट खाली है
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-md"
        >
          <FaArrowLeft className="inline mr-2" /> खरीदारी जारी रखें
        </button>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 px-2 sm:px-6 py-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition"
          >
            <FaArrowLeft /> <span className="font-semibold">वापस जाएँ</span>
          </button>
          <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold">
            <MdShoppingBag /> {cartItems.length} आइटम
          </div>
        </div>

        {/* Cart Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-amber-100">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-left">
                  <th className="p-3 font-semibold">प्रोडक्ट</th>
                  <th className="p-3 text-right font-semibold">दाम</th>
                  <th className="p-3 text-center font-semibold">संख्या</th>
                  <th className="p-3 text-right font-semibold">कुल</th>
                  <th className="p-3 text-center font-semibold">ऑप्शन</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b hover:bg-amber-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {item.productName}
                    </td>
                    <td className="p-3 text-right text-gray-700 font-semibold">
                      ₹{item.productPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.productQuantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="w-16 border border-amber-300 text-center rounded-md p-1 focus:ring-2 focus:ring-amber-300"
                      />
                    </td>
                    <td className="p-3 text-right font-bold text-amber-700">
                      ₹
                      {calculateTotal(
                        item.productPrice,
                        item.productQuantity
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteCartItem(item._id)}
                        className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-md transition"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">कुल प्रोडक्ट्स:</span>
            <span className="font-bold text-amber-700 text-lg">
              {cartItems.length}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-dashed pt-3">
            <span className="font-semibold text-gray-700">कुल योग:</span>
            <span className="font-bold text-2xl text-green-700">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200">
            ⚠️ हर प्रोडक्ट का ऑर्डर कम से कम 5 पीस का होना चाहिए
          </p>

          <button
            onClick={handleConfirmOrder}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition"
          >
            <FaCheckCircle /> ऑर्डर कन्फर्म करें
          </button>
        </div>
      </div>

      {/* Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <Navbar />
      </div>
    </div>
  );
};

export default CartView;
