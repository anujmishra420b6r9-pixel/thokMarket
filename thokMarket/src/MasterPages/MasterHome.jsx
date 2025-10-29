import React from "react";
import { useNavigate } from "react-router-dom";

const MasterHome = () => {
  const navigate = useNavigate();

  const buttons = [
    { label: "Create Admin", path: "/createAdmin", color: "bg-blue-600" },
    { label: "Create Product Type", path: "/createProductType", color: "bg-green-600" },
    { label: "Create Category", path: "/createCategory", color: "bg-purple-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Master Dashboard
      </h1>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        𝑊𝑒𝑙𝑐𝑜𝑚𝑒 𝑇𝑜 ThokMarket</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={() => navigate(btn.path)}
            className={`${btn.color} hover:opacity-90 text-white font-semibold py-4 rounded-2xl shadow-md transition-all duration-200 hover:scale-105`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MasterHome;
