import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-toastify";
import { ArrowLeft, Copy } from "lucide-react";

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

  const handleBack = () => navigate(-1);

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
      const res = await api.post(`/updateOrderStatus/${order._id}`, {
        status: finalReason,
      });
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-xl text-gray-500">
        Loading Order Details...
      </div>
    );

  if (!order)
    return (
      <div className="flex justify-center items-center h-[80vh] text-red-500 text-lg">
        Order not found.
      </div>
    );

  // Normalize status
  const rawStatus = (order.status || order.orderStatus || "")
    .toString()
    .toLowerCase();

  const phone =
    order.phone ||
    order.userPhone ||
    order?.user?.phone ||
    order?.shipping?.phone ||
    order?.customerPhone ||
    "";

  const isPending = rawStatus.includes("pending");
  const isConfirmed = rawStatus.includes("confirm");
  const isDelivered = rawStatus.includes("deliver");
  const isCancelled = rawStatus.includes("cancel");

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-6">
      <div className="flex items-center gap-3 border-b pb-4 mb-4">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">
            Order Details
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Order Date:{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Order Status:
            <span className="font-medium text-blue-600 ml-1 capitalize">
              {order.status || order.orderStatus || "Pending"}
            </span>
          </p>
        </div>
      </div>

      {/* Items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Products in Order
        </h2>
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Price (₹)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Product Type</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{i + 1}</td>
                  <td className="py-3 px-4">{item.productName}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">₹{item.price}</td>
                  <td className="py-3 px-4">{item.category || "—"}</td>
                  <td className="py-3 px-4">{item.productType || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-5">
        <p className="text-xl font-semibold text-gray-800">
          Total Amount: ₹
          {order.items.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
            0
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 border-t pt-4">
        {userRank === "user" && !isDelivered && !isCancelled && (
          <div className="text-right">
            <button
              onClick={() => setShowCancelForm(!showCancelForm)}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
            >
              Cancel Order
            </button>
          </div>
        )}

        {userRank === "admin" && (
          <div className="flex flex-wrap gap-3 justify-end">
            {isPending && (
              <>
                <button
                  onClick={() => handleStatusUpdate("order confirmed")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => setShowCancelForm(!showCancelForm)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel Order
                </button>
              </>
            )}

            {/* ✅ Confirm के बाद अब ये दिखेगा */}
            {isConfirmed && !isDelivered && (
              <button
                onClick={() => handleStatusUpdate("order delivered")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Mark Delivered
              </button>
            )}
          </div>
        )}

        {showCancelForm && (
          <div className="mt-6 border p-4 rounded-xl bg-gray-50">
            <h3 className="font-semibold mb-3 text-gray-700">
              कृपया कैंसिल करने का कारण चुनें:
            </h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {(userRank === "user" ? userCancelReasons : adminCancelReasons).map(
                (reason, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <span>{reason}</span>
                  </label>
                )
              )}
            </div>

            <input
              type="text"
              placeholder="अगर अन्य कारण है तो यहाँ लिखें..."
              className="border rounded-md w-full p-2 mt-3"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCancelForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleCancelSubmit}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleOrderPage;
