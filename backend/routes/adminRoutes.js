const express = require("express");
const router = express.Router();
const {
  getStats,
  getAllReviews,
  approveReview,
  flagReview,
  deleteReview,
  getAllUsers,
  verifyUser,
  rejectUser,
  addCollege,
  addCompany,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes are protected + admin only
router.use(protect);
router.use(adminOnly);

// Stats
router.get("/stats", getStats);

// Reviews
router.get("/reviews", getAllReviews);
router.put("/reviews/:id/approve", approveReview);
router.put("/reviews/:id/flag", flagReview);
router.delete("/reviews/:id", deleteReview);

// Users
router.get("/users", getAllUsers);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/reject", rejectUser);

// Add colleges/companies
router.post("/colleges", addCollege);
router.post("/companies", addCompany);

module.exports = router;
