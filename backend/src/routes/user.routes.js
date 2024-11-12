import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updatePassword,
  updateUserDetails,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { jwtVerify } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(jwtVerify, logoutUser);
router.route("/current-user").get(jwtVerify, getCurrentUser);
router.route("/refresh-token").patch(jwtVerify, refreshAccessToken);
router.route("/update-user").patch(jwtVerify, updateUserDetails),
router.route("/update-avatar").patch(jwtVerify,upload.single("avatar"), updateAvatar);
router.route("/update-password").patch(jwtVerify,updatePassword)

export default router;
