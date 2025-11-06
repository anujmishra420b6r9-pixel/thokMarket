import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const ProductWithProductType = () => {
  const { productType } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchProductsByType();
  }, [productType]);

  const fetchProductsByType = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/productWithProductType/${productType}`);
      const data = res.data;
      if (data.success) {
        setProducts(data.data || []);
        const initialQuantities = {};
        data.data.forEach((p) => { initialQuantities[p._id] = 5; });
        setQuantities(initialQuantities);
      } else {
        setError("No products found for this type.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    const val = parseInt(value);
    if (!isNaN(val)) {
      setQuantities((prev) => ({ ...prev, [productId]: val }));
    } else if (value === "") {
      setQuantities((prev) => ({ ...prev, [productId]: "" }));
    }
  };

  const incrementQuantity = (productId) => {
    setQuantities((prev) => ({ ...prev, [productId]: (prev[productId] || 5) + 1 }));
  };

  const decrementQuantity = (productId) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max((prev[productId] || 5) - 1, 5) }));
  };

  const handleAddToCart = async (product) => {
    const qty = quantities[product._id];
    if (!qty || qty < 5) {
      toast.error("Quantity must be at least 5.");
      return;
    }
    try {
      const cartData = { productId: product._id, quantity: qty };
      const res = await api.post("/cart", cartData);
      console.log("Cart response:", res.data);
      toast.success("Product added to cart!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart.");
    }
  };

  // 🔹 जब किसी प्रोडक्ट पर क्लिक किया जाए
  const handleNavigateToSingleProduct = async (product) => {
    try {
      // ✅ 1️⃣ पहले Single Product डेटा लाने के लिए request
      await api.get(`/singleProduct/${product._id}`);

      // ✅ 2️⃣ फिर साथ में checkCreator API को भी call करो
      const checkRes = await api.post(`/check-creator/${product._id}`);
      // console.log("Check Creator Response:", checkRes.data);

      // ✅ फिर navigate करो single product page पर
      navigate(`/singleProduct/${product._id}`, {
        state: {
          quantity: quantities[product._id] || 5,
          creatorCheck: checkRes.data, // checkCreator का डेटा भी साथ भेज दो
        },
      });
    } catch (err) {
      console.error("Error while fetching product details:", err);
      toast.error("Failed to load product details.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 text-lg font-medium animate-pulse">प्रोडक्ट लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">लोड करने में दिक्कत आई है</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button onClick={fetchProductsByType} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Retry</button>
            <button onClick={() => navigate("/")} className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const decodedProductType = decodeURIComponent(productType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-t-4 border-indigo-600">
          <button onClick={() => navigate("/")} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors group">
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">वापस जाएँ</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {decodedProductType}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">{products.length} मौजूद प्रोडक्ट्स</span>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">कोई प्रोडक्ट्स नहीं मिले</h3>
            <p className="text-gray-600 mb-6"> विक्रेता के लिए कोई प्रोडक्ट उपलब्ध नहीं है{decodedProductType}</p>
            <button onClick={() => navigate("/")} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition font-medium">Back to Home</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, index) => (
              <form key={p._id} onSubmit={(e) => { e.preventDefault(); handleAddToCart(p); }} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-400 transform hover:-translate-y-2" style={{ animationDelay: `${index * 50}ms`, animation: 'fadeIn 0.5s ease-out forwards', opacity: 0 }}>
                {/* Product Image - Clickable */}
                <div onClick={(e) => { if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") handleNavigateToSingleProduct(p); }} className="cursor-pointer">
                  <div className="relative h-64 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden group">
                    {p.productFile1 ? (
                      <img src={p.productFile1} alt={p.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-indigo-600 font-bold text-sm">₹{p.productPrice}</span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
                      {p.productName}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {p.productDescription}
                    </p>
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="px-5 pb-5 space-y-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">संख्या (Min: 5)</label>
                    <div className="flex items-center justify-center space-x-3">
                      <button type="button" onClick={() => decrementQuantity(p._id)} className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" />
                        </svg>
                      </button>
                      <input type="number" value={quantities[p._id]} onChange={(e) => handleQuantityChange(p._id, e.target.value)} className="w-20 text-center text-lg font-bold border-2 border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                      <button type="button" onClick={() => incrementQuantity(p._id)} className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-10 0a1.5 1.5 0 003 0m-3 0a1.5 1.5 0 00-3 0m3 0h1.5m-1.5 0a1.5 1.5 0 003 0" />
                    </svg>
                    <span>कार्ट में डालें</span>
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <div className="fixed bottom-0 left-0 w-full z-50">
        <Navbar />
      </div>
    </div>
  );
};

export default ProductWithProductType;
