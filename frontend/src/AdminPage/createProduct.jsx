import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import imageCompression from "browser-image-compression"; // ⭐ NEW

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

  // -------------------------------------
  // ⭐ IMAGE COMPRESS FUNCTION ADDED HERE
  // -------------------------------------
  const handleImageChange = async (e, idx) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/"))
      return toast.error("Only images allowed");

    if (file.size > 10 * 1024 * 1024)
      return toast.error("Max 10MB per image");

    try {
      // ⭐ IMAGE COMPRESSION OPTIONS
      const options = {
        maxSizeMB: 1, // final size around 1MB
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        initialQuality: 0.9, // ⭐ High quality (90%)
      };

      // ⭐ COMPRESS IMAGE
      const compressedFile = await imageCompression(file, options);

      const newImages = [...images];
      const newPreviews = [...previews];

      newImages[idx] = compressedFile;

      // Create Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews[idx] = reader.result;
        setPreviews(newPreviews);
      };
      reader.readAsDataURL(compressedFile);

      setImages(newImages);

      toast.success(`Image ${idx + 1} compressed successfully!`);
    } catch (err) {
      toast.error("Image compression failed");
    }
  };

  const removeImage = (idx) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    newImages[idx] = null;
    newPreviews[idx] = "";
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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

    // ⭐ SEND COMPRESSED IMAGES
    images.forEach((img) => form.append("productFiles", img));

    try {
      setLoading(true);
      const res = await api.post("/productCreate", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "Product created!");
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
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-b-4 border-blue-600 rounded-full mx-auto mb-4"></div>
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
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* BACK BUTTON */}
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

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-t-4 border-blue-600">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            🛍️ Create New Product
          </h1>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex flex-wrap justify-between items-center text-sm gap-3">
              <div>
                <strong>Admin:</strong> {admin.name}
              </div>
              <div>
                <strong>Category:</strong> {admin.category}
              </div>
              <div>
                <strong>ID:</strong>{" "}
                <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                  {admin.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">

          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full px-4 py-3 border-2 rounded-xl"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Price (₹) *
            </label>
            <input
              type="number"
              name="productPrice"
              value={formData.productPrice}
              onChange={handleChange}
              placeholder="Enter price"
              className="w-full px-4 py-3 border-2 rounded-xl"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="productDescription"
              value={formData.productDescription}
              onChange={handleChange}
              rows={5}
              placeholder="Enter detailed description"
              className="w-full px-4 py-3 border-2 rounded-xl resize-none"
            />
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Product Type *
            </label>

            <div
              onClick={() => setShowTypes(!showTypes)}
              className="border-2 px-4 py-3 rounded-xl cursor-pointer bg-white"
            >
              {formData.productType || "Click to select product type"}
            </div>

            {showTypes && (
              <div className="border rounded-xl p-4 mt-2 max-h-64 overflow-y-auto bg-gray-50">
                {productTypes.map((pt) => (
                  <div
                    key={pt._id}
                    onClick={() => {
                      setFormData((p) => ({
                        ...p,
                        productType: pt.productType,
                      }));
                      setShowTypes(false);
                    }}
                    className="p-2 border rounded-lg my-1 cursor-pointer hover:bg-blue-100"
                  >
                    {pt.productType}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IMAGES */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Product Images * (3 Required)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="border-2 border-dashed p-4 rounded-xl">
                  {previews[idx] ? (
                    <div className="relative">
                      <img
                        src={previews[idx]}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center py-10">
                      <p className="text-gray-500">Upload Image {idx + 1}</p>
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

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
