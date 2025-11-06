import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const SingalProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(location.state?.quantity || 5);
  const [creatorInfo, setCreatorInfo] = useState(
    location.state?.creatorCheck || null
  );
  const [currentImage, setCurrentImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/singleProduct/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
        } else {
          setError(res.data.message || "Product not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch product.");
        toast.error("Failed to fetch product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!creatorInfo) {
      (async () => {
        try {
          const res = await api.post(`/check-creator/${id}`);
          setCreatorInfo(res.data);
        } catch (err) {
          console.error("Failed to fetch creator info:", err);
        }
      })();
    }
  }, [id]); // Removed creatorInfo from dependency array to prevent re-fetch

  useEffect(() => {
    setImageLoaded(false);
  }, [currentImage]);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) setQuantity(val >= 1 ? val : 1);
    else if (e.target.value === "") setQuantity("");
  };

  const handleAddToCart = async () => {
    if (!quantity || quantity < 5) {
      toast.error("Quantity must be at least 5.");
      return;
    }
    try {
      const res = await api.post("/cart", {
        productId: product._id,
        quantity,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Product added to cart!");
        navigate(navigate(-1))
      } else {
        toast.error(res.data.message || "Failed to add to cart.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart.");
    }
  };

  // =================================================================
  // == NEW FUNCTION: Handle Product Delete ==
  // =================================================================
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    const toastId = toast.loading("Deleting product...");
    try {
      // Use 'id' from useParams, which is the productId
      const res = await api.delete(`/deleteProduct/${id}`);
      
      // Assuming the response has a 'success' boolean
      if (res.data.success) {
        toast.update(toastId, {
          render: "Product deleted successfully!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        navigate("/"); // Navigate to home page
      } else {
        toast.update(toastId, {
          render: res.data.message || "Failed to delete product.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.update(toastId, {
        render: "An error occurred while deleting.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  // =================================================================
  // == NEW FUNCTION: Handle Product Update Navigation ==
  // =================================================================
  const handleUpdate = async () => {
  try {
    const res = await api.get(`/singleProduct/${id}`);
    if (res.data.success) {
      // navigate to UpdateProduct page with product data
      navigate("/UpdateProduct", { state: { productDetails: res.data.data } });
    } else {
      toast.error(res.data.message || "Failed to fetch product details.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error fetching product details for update.");
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">प्रोडक्ट लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = [
    product.productFile1,
    product.productFile2,
    product.productFile3,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-all font-semibold group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            वापस जाएँ
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Image Gallery */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                  <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100">
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                      </div>
                    )}
                    <img
                      src={images[currentImage]}
                      alt={product.productName}
                      className={`w-full h-full object-contain p-8 transition-opacity duration-300 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setImageLoaded(true)}
                    />

                    {/* Image Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImage((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                        >
                          <svg
                            className="w-6 h-6 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImage((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                        >
                          <svg
                            className="w-6 h-6 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {currentImage + 1} / {images.length}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-3 transition-all transform hover:scale-105 ${
                          currentImage === idx
                            ? "border-indigo-600 ring-4 ring-indigo-200 scale-105 shadow-lg"
                            : "border-gray-200 hover:border-indigo-300 shadow-md"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.productName} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {currentImage === idx && (
                          <div className="absolute inset-0 bg-indigo-600/10"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-gray-100">
                <div className="text-center text-gray-400 p-8">
                  <svg
                    className="w-32 h-32 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">कोई इमेज उपलब्ध नहीं है</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="flex flex-col">
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
              {/* Product Title & Description */}
              <div className="mb-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.productName}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.productDescription}
                </p>
              </div>

              {/* Price with Badge */}
              <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-indigo-600">
                    ₹{product.productPrice?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-500 text-lg font-medium">
                    एक पीस
                  </span>
                </div>
                <div className="mt-2 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ सर्वश्रेष्ठ कीमत की गारंटी
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-base font-bold text-gray-800 mb-4">
                  Select Quantity{" "}
                  <span className="text-indigo-600">(Minimum 5 units)</span>
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementQuantity}
                    className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all shadow-md hover:shadow-lg text-2xl font-bold text-gray-700 active:scale-95"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-28 h-14 text-center text-2xl font-bold border-3 border-indigo-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                    min="1"
                  />
                  <button
                    onClick={incrementQuantity}
                    className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all shadow-md hover:shadow-lg text-2xl font-bold text-gray-700 active:scale-95"
                  >
                    +
                  </button>
                </div>
                {quantity < 5 && (
                  <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-semibold">
                      न्यूनतम ऑर्डर मात्रा 5 पीस है
                    </span>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!quantity || quantity < 5}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl transition-all shadow-xl hover:shadow-2xl disabled:shadow-none active:scale-98 flex items-center justify-center gap-3"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                कार्ट में जोड़ें
              </button>

              {/* Total Price Preview */}
              {quantity >= 5 && (
                <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-bold text-lg">
                      कुल राशि:
                    </span>
                    <span className="text-3xl font-bold text-green-600">
                      ₹
                      {(product.productPrice * quantity).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    सभी टैक्स शामिल हैं
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Creator Info Section */}
        {creatorInfo && (
          <div className="mt-8 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-7 h-7"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                विक्रेता की जानकारी
              </h3>
            </div>
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    {creatorInfo.message
                      ? creatorInfo.message
                      : creatorInfo.isCreator
                      ? "✅ You are the creator of this product."
                      : "This product is offered by a verified seller on our platform."}
                  </p>
                  {creatorInfo.creatorName && (
                    <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3 rounded-xl border border-indigo-200">
                      <span className="font-bold text-gray-700">Seller:</span>
                      <span className="text-indigo-600 font-bold text-lg">
                        {creatorInfo.creatorName}
                      </span>
                      <span className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        ✓ Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ================================================================= */}
              {/* == NEW CREATOR ACTION BUTTONS == */}
              {/* ================================================================= */}
              {creatorInfo.isCreator && (
                <div className="mt-6 border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleUpdate}
                    className="w-full sm:w-auto flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Update Product
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full sm:w-auto flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Product
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 w-full z-50">
        <Navbar />
      </div>
    </div>
  );
};

export default SingalProduct;