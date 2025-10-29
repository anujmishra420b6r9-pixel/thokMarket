import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaShoppingCart, FaUser } from "react-icons/fa";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: <FaHome />,
    },
    {
      path: "/CartView",
      label: "Cart",
      icon: <FaShoppingCart />,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: <FaUser />,
    },
  ];

  return (
    <>
      {/* Desktop Navbar - Top */}
      <nav className="hidden md:block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🛍️</span>
              </div>
              <span className="text-2xl font-bold">ThokMarket</span>
            </div>

            {/* Desktop Nav Items */}
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    location.pathname === item.path
                      ? "bg-white text-indigo-600 shadow-xl scale-105"
                      : "hover:bg-white/20 hover:scale-105"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl z-50">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center relative group"
            >
              {/* Active Indicator */}
              {location.pathname === item.path && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full shadow-lg"></div>
              )}

              {/* Icon Container */}
              <div
                className={`flex flex-col items-center justify-center transition-all duration-300 ${
                  location.pathname === item.path
                    ? "transform -translate-y-1"
                    : ""
                }`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                    location.pathname === item.path
                      ? "bg-white shadow-lg scale-110"
                      : "bg-white/20 group-hover:bg-white/30"
                  }`}
                >
                  <span
                    className={`text-xl transition-colors duration-300 ${
                      location.pathname === item.path
                        ? "text-indigo-600"
                        : "text-white group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                </div>
                <span
                  className={`text-xs mt-1 font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? "text-white font-bold"
                      : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile bottom navbar */}
      <div className="md:hidden h-20"></div>
    </>
  );
};

export default Navbar;