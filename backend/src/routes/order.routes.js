import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import { createOrderFromCart, deleteOrder, getUserOrders, updateOrderStatus } from "../controller/order.controller.js";

const router = Router()

router.route("/create").post(jwtVerify,createOrderFromCart)
router.route("/update-status").patch(jwtVerify, updateOrderStatus)
router.route("/customer").get(jwtVerify, getUserOrders)
router.route("/delete/:orderId").delete(jwtVerify, deleteOrder)

export default router