import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import { addToCart, getCart, removeItem, updateItemQuantity} from "../controller/cart.controller.js";


const router = Router()


router.route("/").post(addToCart).get(getCart)
router.route("/update-quantity").patch(updateItemQuantity)
router.route("/remove-item/:productId").patch(removeItem)

export default router