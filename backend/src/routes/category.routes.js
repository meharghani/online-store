import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controller/category-controller.js";

const router = Router()

router.use(jwtVerify)
router.route("/").post(createCategory).get(getCategories)
router.route("/:categoryId").get(getCategoryById).patch(updateCategory).delete(deleteCategory)



export default router