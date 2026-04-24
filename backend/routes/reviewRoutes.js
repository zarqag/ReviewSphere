const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviews,
  getReviewById,
  upvoteReview,
  editReview,
  deleteReview,
  getMyReviews,
  askAI,
  getAnalytics,
} = require("../controllers/reviewController");
const { protect, verifiedOnly } = require("../middleware/authMiddleware");
// AI route
router.post("/ask-ai", askAI); // POST /api/reviews/ask-ai

router.get("/analytics/:targetType/:targetId", getAnalytics);

// Public
router.get("/:targetType/:targetId", getReviews);
router.get("/single/:id", getReviewById);

// Protected (logged in)
router.get("/my/reviews", protect, getMyReviews);
router.post("/upvote/:id", protect, upvoteReview);
router.put("/:id", protect, editReview);
router.delete("/:id", protect, deleteReview);

// Protected + Verified only
router.post("/", protect, verifiedOnly, createReview);

module.exports = router;
