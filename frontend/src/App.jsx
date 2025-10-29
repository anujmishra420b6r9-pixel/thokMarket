import React from 'react'
import { Routes, Route } from 'react-router-dom'; 
import { ToastContainer } from "react-toastify";
import Signup from './pages/Singup'
import HomePage from './pages/HomePage'
import Login from './pages/login'
import MasterHome from './MasterPages/MasterHome'
import CreateAdmin from './MasterPages/CreateAdmin'
import CreateProTy from './MasterPages/CreateProTy'
import CreateCate from './MasterPages/CreateCate'
import CreateProduct from "./AdminPage/CreateProduct"
import ProductWithProductType from './pages/productwithProductType';
import SingalProduct from "./pages/singalProduct";
import CartView from './pages/cartView';
import Profile from './pages/profile';
import Navbar from './components/Navbar';
import UpdateProduct from './AdminPage/UpdateProduct';
import SingalOrderPage from './pages/SingalOrderPage';

const App = () => {
  return (
    <div className="relative min-h-screen pb-20"> 
      {/* pb-20 → Navbar के लिए padding bottom */}
      <Routes>
        <Route path="/Signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/MasterHome" element={<MasterHome />} />
        <Route path="/createAdmin" element={<CreateAdmin />} />
        <Route path="/createProductType" element={<CreateProTy />} />
        <Route path="/createCategory" element={<CreateCate />} />
        <Route path="/UpdateProduct" element={<UpdateProduct />} />
        <Route path="/CreateProduct" element={<CreateProduct />} />
        <Route path="/productWithProductType/:productType" element={<ProductWithProductType />} />
        <Route path="/singleProduct/:id" element={<SingalProduct />} />
        <Route path="/CartView" element={<CartView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/SingleOrderPage" element={<SingalOrderPage />} />

      </Routes>
      <ToastContainer />
      
    </div>
  )
}

export default App
