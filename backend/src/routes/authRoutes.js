// routes/authRoutes.js
import express from "express";
import { userSignup, adminSignup, login, logout, me, updateProfile } from "../controllers/authController.js";
import { CategoryRoute, deleteCategory, deleteProductType, getAllCategory, getAllProductType, ProductTypeRoute } from "../controllers/categoryProType.js";
import { deleteProduct, productCreate, updateProduct } from "../controllers/conProduct.js";
import { upload } from "../middlewares/multer.js";
import { cart, cartView, deleteCartProduct } from "../controllers/controllerCart.js";
import { createOrderHistory, updateOrderStatus, viewSingleOrder} from "../controllers/controllOrderHistory.js";
import { homePage, productWithProductType, profile, singleProduct, viewCart, viewOrderHistory } from "../controllers/page.js";
import {authenticate} from "../middlewares/checkRole.js";
import { checkCreator } from "../middlewares/checkCreater.js";
import { checkMaster } from "../middlewares/checkMaster.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();


router.post("/userSignup", userSignup);
router.post("/adminSignup",authenticate,checkMaster, adminSignup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/createCategory",authenticate,checkMaster, CategoryRoute);
router.post("/createProductType",authenticate,upload.single("image"),ProductTypeRoute);
router.post("/productCreate",  authenticate,checkAdmin, upload.fields([{ name: "productFiles", maxCount: 3 }]),productCreate);export default router;
router.post("/cart", authenticate ,cart);
router.post("/orderHistory",authenticate,createOrderHistory);
router.post("/check-creator/:id", authenticate, checkCreator);
router.post("/updateOrderStatus/:id", updateOrderStatus);
router.post("/updateProduct", authenticate,checkAdmin, updateProduct);

router.get("/homePage", authenticate, homePage );
router.get("/productWithProductType/:productType", productWithProductType );
router.get("/singleProduct/:id",authenticate, singleProduct);
router.get("/orderHistory",authenticate, viewOrderHistory );
router.get("/viewCart", viewCart );
router.get("/profile",authenticate, profile );
router.get("/getAllCategory", getAllCategory)
router.get("/getAllProductType",authenticate,   getAllProductType)
router.get("/getRole", authenticate, me);
router.get("/cartView", authenticate, cartView);
router.get("/viewSingleOrder", authenticate, viewSingleOrder);


router.delete("/deleteCartProduct/:cartId", deleteCartProduct );
router.delete("/deleteProduct/:productId",authenticate,checkAdmin, deleteProduct );
router.delete("/deleteProductType/:typeId", deleteProductType );//
router.delete("/deleteCategory/:id", deleteCategory );//



   
router.put("/updateProfile/:id", updateProfile );//(user/admin)
router.put("/updateProduct/:id", updateProduct );//


