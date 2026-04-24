const express = require("express");
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register); // POST /api/auth/register
router.post("/verify-otp", verifyOTP); // POST /api/auth/verify-otp
router.post("/resend-otp", resendOTP); // POST /api/auth/resend-otp
router.post("/login", login); // POST /api/auth/login
router.get("/me", protect, getMe); // GET /api/auth/me (protected)

router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
