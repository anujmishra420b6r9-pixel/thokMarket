import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // 👈 नया import

const CreateProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: "",
    productPrice: "",
    productDescription: "",
    productType: "",
  });
  const [admin, setAdmin] = useState({
    id: "",
    category: "",
    name: "",
    loaded: false,
  });
  const [productTypes, setProductTypes] = useState([]);
  const [showTypes, setShowTypes] = useState(false);
  const [images, setImages] = useState([null, null, null]);
  const [previews, setPreviews] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get("/getRole");
        if (res.data?.id && res.data?.category) {
          setAdmin({
            id: res.data.id,
            category: res.data.category,
            name: res.data.name || "Admin",
            loaded: true,
          });
          toast.success(`Welcome, ${res.data.name || "Admin"}!`);
        } else toast.error("Admin login required");
      } catch {
        toast.error("Failed to fetch admin info");
      } finally {
        setFetching(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!admin.loaded) return;
    api
      .get("/getAllProductType")
      .then((res) => res.data.success && setProductTypes(res.data.data))
      .catch(() => toast.error("Failed to fetch product types"));
  }, [admin.loaded]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e, idx) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/"))
      return toast.error("Only images allowed");
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Max 5MB per image");

    const newImages = [...images],
      newPreviews = [...previews];
    newImages[idx] = file;

    const reader = new FileReader();
    reader.onloadend = () => {
      newPreviews[idx] = reader.result;
      setPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
    setImages(newImages);
  };

  const removeImage = (idx) => {
    const newImages = [...images],
      newPreviews = [...previews];
    newImages[idx] = null;
    newPreviews[idx] = "";
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { productName, productPrice, productDescription, productType } =
      formData;

    if (!productName || !productPrice || !productDescription || !productType)
      return toast.error("⚠️ Fill all fields");
    if (images.some((img) => !img))
      return toast.error("⚠️ Upload all 3 images");

    const form = new FormData();
    form.append("productName", productName);
    form.append("productPrice", productPrice);
    form.append("productDescription", productDescription);
    form.append("productType", productType);
    form.append("category", admin.category);
    form.append("adminId", admin.id);
    images.forEach((img) => form.append("productFiles", img));

    try {
      setLoading(true);
      const res = await api.post("/productCreate", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "✅ Product created!");
      setFormData({
        productName: "",
        productPrice: "",
        productDescription: "",
        productType: "",
      });
      setImages([null, null, null]);
      setPreviews(["", "", ""]);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );

  if (!admin.loaded)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Admin login required to create products
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-blue-700 hover:text-blue-900 transition-all font-semibold group"
        >
          <ArrowLeft
            size={22}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-t-4 border-blue-600">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            🛍️ Create New Product
          </h1>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Admin:</span>{" "}
                <span className="font-bold text-gray-800">{admin.name}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Category:</span>{" "}
                <span className="font-bold text-blue-600">{admin.category}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">ID:</span>{" "}
                <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                  {admin.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              name="productName"
              placeholder="Enter product name"
              value={formData.productName}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              required
            />
          </div>

          {/* Product Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              name="productPrice"
              type="number"
              placeholder="Enter price"
              value={formData.productPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="productDescription"
              placeholder="Enter detailed product description"
              value={formData.productDescription}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
              required
            />
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Type <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setShowTypes(!showTypes)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all bg-white flex justify-between items-center"
            >
              <span
                className={
                  formData.productType
                    ? "text-gray-800 font-semibold"
                    : "text-gray-400"
                }
              >
                {formData.productType || "Click to select product type"}
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  showTypes ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {showTypes && (
              <div className="mt-3 border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-blue-50 max-h-64 overflow-y-auto">
                {productTypes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {productTypes.map((pt) => (
                      <label
                        key={pt._id}
                        className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all transform hover:scale-105 ${
                          formData.productType === pt.productType
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-lg"
                            : "border-gray-300 hover:border-blue-300 bg-white hover:shadow-md"
                        }`}
                      >
                        <input
                          type="radio"
                          name="productType"
                          value={pt.productType}
                          checked={formData.productType === pt.productType}
                          onChange={() => {
                            setFormData((prev) => ({
                              ...prev,
                              productType: pt.productType,
                            }));
                            setShowTypes(false);
                          }}
                          className="hidden"
                        />
                        <div className="text-sm font-semibold">
                          {pt.productType}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {pt.category}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-3">
                      No product types available
                    </p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Reload
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Product Images <span className="text-red-500">* (3 required)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-all bg-gradient-to-br from-gray-50 to-blue-50"
                >
                  {previews[idx] ? (
                    <div className="relative group">
                      <img
                        src={previews[idx]}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100 transform hover:scale-110"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Image {idx + 1}
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block text-center py-12 hover:bg-blue-50 rounded-lg transition-all">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-gray-600 mb-1">
                        Upload Image {idx + 1}
                      </p>
                      <p className="text-xs text-gray-500">Max 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, idx)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Product...
              </span>
            ) : (
              "Create Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
