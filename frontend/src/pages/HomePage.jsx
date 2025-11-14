import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/homePage");
      const data = response.data;

      if (data.success) {
        setProducts(data.data.products || []);
      } else {
        setError("Failed to fetch products");
        navigate("/Signup");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      navigate("/Signup");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.productType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 text-lg font-medium">Loading Products...</p>
      </div>
    );
  }

  if (error) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-6">
      <div className="w-full">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-6 pb-4 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ThokMarket में आपका स्वागत है
          </h1>

          {/* SEARCH BAR */}
          <div className="max-w-lg mx-auto mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="प्रोडक्ट खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-md"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600 mt-2">
              {filteredProducts.length} items
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="px-4 mt-3">
          {filteredProducts.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">

              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/productWithProductType/${product.productType}`)}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-2xl border hover:border-indigo-400 cursor-pointer transform hover:-translate-y-1 hover:scale-105 transition-all text-center"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "fadeIn 0.5s ease-out forwards",
                    opacity: 0
                  }}
                >

                  {/* PRODUCT IMAGE */}
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-md mx-auto mb-3 bg-gray-100">
                    <img
                      src={product.image || "/default.png"}
                      alt={product.productType}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* PRODUCT NAME */}
                  <h3 className="text-gray-800 font-semibold text-sm line-clamp-2">
                    {product.productType}
                  </h3>
                </div>
              ))}

            </div>
          ) : (
            <div className="text-center mt-20 bg-white p-10 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-800">No Products Found</h3>
              <p className="text-gray-600 mt-1">Try searching something else</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="fixed bottom-0 left-0 w-full z-50">
        <Navbar />
      </div>
    </div>
  );
};

export default HomePage;
