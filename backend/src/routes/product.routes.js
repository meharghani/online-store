import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import { addProduct, deleteProduct, getProductById, getProducts, updateProduct, updateProductImages } from "../controller/product.controller.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router()


router.route("/add-product").post(jwtVerify,upload.array("images",5),addProduct)
router.route("/").get(getProducts)
router.route("/:productId").get(getProductById).patch(jwtVerify,updateProduct).delete(jwtVerify, deleteProduct)
router.route("/update-images/:productId").patch(jwtVerify,upload.array("images",5),updateProductImages)







export default router