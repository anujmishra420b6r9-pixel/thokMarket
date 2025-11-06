import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-toastify";

const SingleOrderPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedOrder = location.state?.order;
  const passedRank = location.state?.rank;
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(passedOrder || null);
  const [userRank, setUserRank] = useState(passedRank || "");
  const [loading, setLoading] = useState(true);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const userCancelReasons = [
    "गलत प्रोडक्ट ऑर्डर कर दिया",
    "क्वांटिटी गलत चुन ली थी",
    "अब यह प्रोडक्ट नहीं चाहिए",
    "डुप्लीकेट ऑर्डर गलती से लग गया",
    "मुझे इससे बेहतर प्रोडक्ट मिल गया कहीं और",
    "डिलीवरी में ज़्यादा समय लग रहा था",
    "मेरे ग्राहक ने ऑर्डर कैंसल कर दिया",
    "प्रोडक्ट तुरंत चाहिए था, लेकिन देरी हो रही थी",
    "प्राइस ज़्यादा लग रही थी / महंगा लग गया",
    "पेमेण्ट करते समय कोई दिक्कत आई",
    "कैश फ्लो की वजह से अभी नहीं खरीद सकता",
    "मुझे अब ये ऑर्डर रखना नहीं है",
    "स्टॉक में कुछ गड़बड़ी थी (Out of Stock)",
    "सप्लायर ने ऑर्डर कन्फर्म नहीं किया",
    "अन्य कारण (Other Reason)",
  ];

  const adminCancelReasons = [
    "🧍‍♂️ Customer ने Order Cancel करने को कहा",
    "☎️ Customer से Contact नहीं हो पाया",
    "📦 Product Out of Stock है",
    "💰 Wrong / Invalid Payment Received",
    "🏠 Delivery Address गलत या अधूरा है",
    "🚚 Courier Service उस Area में Deliver नहीं करती",
    "🔁 Duplicate Order था (Customer ने दो बार Order कर दिया)",
    "⚙️ Product Quality Issue पाया गया Dispatch से पहले",
    "🕒 Customer ने Late Delivery की वजह से Cancel किया",
    "❌ Fraud / Suspicious Order पाया गया",
  ];

  useEffect(() => {
    if (!orderId) {
      toast.error("Invalid order. Redirecting back.");
      navigate(-1);
      return;
    }
    if (passedOrder) {
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/viewSingleOrder`, { params: { orderId } });
        if (res.data.success) {
          setOrder(res.data.orderDetails);
          setUserRank(res.data.rank);
        } else toast.error(res.data.message || "Failed to fetch order.");
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong while fetching order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, passedOrder, navigate]);

  const handleStatusUpdate = async (status) => {
    if (!order?._id) return;
    try {
      const res = await api.post(`/updateOrderStatus/${order._id}`, { status });
      if (res.data.success) {
        toast.success(res.data.message || "Order status updated!");
        setOrder({ ...order, status });
      } else toast.error(res.data.message || "Failed to update status.");
    } catch (err) {
      console.error(err);
      toast.error("Error updating order status");
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason && !customReason.trim()) {
      toast.error("कृपया एक कारण चुनें या लिखें।");
      return;
    }
    const finalReason = `cancel (${cancelReason || customReason}) by ${userRank}`;
    try {
      const res = await api.post(`/updateOrderStatus/${order._id}`, { status: finalReason });
      if (res.data.success) {
        toast.success("Order cancelled successfully!");
        setShowCancelForm(false);
        setOrder({ ...order, status: finalReason });
      } else toast.error(res.data.message || "Failed to cancel order.");
    } catch (error) {
      console.error(error);
      toast.error("Error cancelling order.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 text-base sm:text-lg font-medium">ऑर्डर लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">कोई ऑर्डर नहीं मिला</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">जिस ऑर्डर की आप तलाश कर रहे हैं, वह नहीं मिला।</p>
          <button onClick={() => navigate(-1)} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition font-medium shadow-lg text-sm sm:text-base">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const rawStatus = (order.status || order.orderStatus || "").toString().toLowerCase();
  const isPending = rawStatus.includes("pending");
  const isConfirmed = rawStatus.includes("confirm");
  const isDelivered = rawStatus.includes("deliver");
  const isCancelled = rawStatus.includes("cancel");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 sm:py-8 px-3 sm:px-4 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 text-white">
            <button onClick={() => navigate(-1)} className="flex items-center text-white hover:text-indigo-100 mb-3 sm:mb-4 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm sm:text-base font-medium">पीछे जाएँ</span>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">ऑर्डर की जानकारी</h1>
            <p className="text-xs sm:text-sm text-indigo-100">
              {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
            </p>
            <div className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm mt-3 ${
              isPending ? "bg-yellow-400 text-yellow-900" : 
              isConfirmed ? "bg-blue-400 text-blue-900" :
              isDelivered ? "bg-green-400 text-green-900" : 
              isCancelled ? "bg-red-400 text-red-900" : "bg-blue-400 text-blue-900"
            }`}>
              {order.status || order.orderStatus || "Pending"}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b-2 border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">ऑर्डर में शामिल प्रोडक्ट्स</h2>
            <p className="text-xs sm:text-sm text-gray-600">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <div className="p-3 sm:p-6">
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">{i + 1}</span>
                    <span className="text-xs text-gray-500">{item.category || "—"}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.productName}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div><span className="font-medium">संख्या:</span> {item.quantity}</div>
                    <div><span className="font-medium">कीमत:</span> ₹{item.price}</div>
                    <div className="col-span-2"><span className="font-medium">प्रकार:</span> {item.productType || "—"}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Subtotal</span>
                      <span className="font-bold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">प्रोडक्ट</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">संख्या</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">कीमत</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">थोक विक्रेता</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">कुल रकम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold text-sm">{i + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.productType || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-800 font-semibold text-sm">₹{item.price}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">{item.category || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-700 font-medium">Total Amount</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ₹{order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!showCancelForm && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            {userRank === "user" && !isDelivered && !isCancelled && (
              <button onClick={() => setShowCancelForm(true)} className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg text-sm sm:text-base">
                ऑर्डर कैंसिल करें
              </button>
            )}

            {userRank === "admin" && (
              <div className="flex flex-col sm:flex-row gap-3">
                {isPending && (
                  <>
                    <button onClick={() => handleStatusUpdate("order confirmed")} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg text-sm sm:text-base">
                      ऑर्डर कन्फर्म करें
                    </button>
                    <button onClick={() => setShowCancelForm(true)} className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg text-sm sm:text-base">
                      ऑर्डर कैंसिल करें
                    </button>
                  </>
                )}
                {isConfirmed && !isDelivered && (
                  <button onClick={() => handleStatusUpdate("order delivered")} className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg text-sm sm:text-base">
                    डिलीवरी पूरी करें
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cancel Form */}
        {showCancelForm && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">कृपया कैंसिल करने का कारण चुनें:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {(userRank === "user" ? userCancelReasons : adminCancelReasons).map((reason, i) => (
                <label key={i} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input type="radio" name="cancelReason" value={reason} checked={cancelReason === reason} onChange={(e) => setCancelReason(e.target.value)} className="mt-1" />
                  <span className="text-sm sm:text-base text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
            <input type="text" placeholder="अगर अन्य कारण है तो यहाँ लिखें..." className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4" value={customReason} onChange={(e) => setCustomReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowCancelForm(false)} className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base">
                Close
              </button>
              <button onClick={handleCancelSubmit} className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg text-sm sm:text-base">
               कैंसिल कन्फर्म करें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleOrderPage;