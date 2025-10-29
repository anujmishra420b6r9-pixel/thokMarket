import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-toastify";

const UpdateProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // पिछली पेज से आया डेटा
  const { productDetails } = location.state || {};

  const [productName, setProductName] = useState(productDetails?.productName || "");
  const [productType] = useState(productDetails?.productType || ""); // ❌ Editable नहीं
  const [productPrice, setProductPrice] = useState(productDetails?.productPrice || "");
  const [productDescription, setProductDescription] = useState(productDetails?.productDescription || "");
  const [loading, setLoading] = useState(false);

  if (!productDetails) {
    return (
      <div className="text-center py-10 text-red-600">
        ❌ Product details not found. Go back and try again.
      </div>
    );
  }

  // ✅ पुरानी image URL सही ढंग से तैयार करना
  const formatImageUrl = (imgPath) => {
    if (!imgPath) return "";
    if (imgPath.startsWith("http")) return imgPath;
    return `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/${imgPath}`;
  };

  // 🧾 Form Submit
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!productName || !productPrice) {
    toast.error("Please fill all required fields");
    return;
  }

  const payload = {
    productId: productDetails._id,
    productName,
    productPrice,
    productDescription,
  };

  try {
    setLoading(true);
    const res = await api.post("/updateProduct", payload); // JSON भेज रहे हैं

    if (res.data.success) {
      toast.success("✅ Product updated successfully!");
      navigate(-1);
    } else {
      toast.error(res.data.message || "Failed to update product");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while updating product");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-3xl mx-auto bg-white p-6 mt-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        ✏️ Update Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block font-semibold mb-1">Product Name</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        {/* Product Type (Non-Editable) */}
        <div>
          <label className="block font-semibold mb-1 text-gray-500">Product Type</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            value={productType}
            disabled
          />
        </div>

        {/* Product Price */}
        <div>
          <label className="block font-semibold mb-1">Price (₹)</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg p-2"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </div>

        {/* ✅ पुरानी Images (सिर्फ देखने के लिए, बदल नहीं सकते) */}
        {productDetails.productImages?.length > 0 && (
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Product Images</label>
            <div className="flex flex-wrap gap-3">
              {productDetails.productImages.map((img, i) => (
                <img
                  key={i}
                  src={formatImageUrl(img)}
                  alt={`old-${i}`}
                  className="w-24 h-24 object-cover border rounded-lg shadow"
                />
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;
