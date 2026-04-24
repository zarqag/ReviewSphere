const Review = require("../models/Review");
const User = require("../models/User");
const College = require("../models/College");
const Company = require("../models/Company");

// ─── DASHBOARD STATS ─────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      totalReviews,
      pendingReviews,
      flaggedReviews,
      totalColleges,
      totalCompanies,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ isVerifiedBadge: true }),
      Review.countDocuments(),
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "flagged" }),
      College.countDocuments(),
      Company.countDocuments(),
    ]);

    res.json({
      totalUsers,
      verifiedUsers,
      totalReviews,
      pendingReviews,
      flaggedReviews,
      totalColleges,
      totalCompanies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL REVIEWS (with filters) ──────────────────
exports.getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const reviews = await Review.find(query)
      .populate("author", "name email role college company isVerifiedBadge")
      .populate("targetId", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── APPROVE A REVIEW ────────────────────────────────
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "✅ Review approved", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── FLAG A REVIEW ────────────────────────────────────
exports.flagReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "flagged" },
      { new: true },
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "🚩 Review flagged", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE A REVIEW ─────────────────────────────────
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    await review.deleteOne();
    res.json({ message: "🗑️ Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL USERS ────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, verified } = req.query;

    const query = { role: { $ne: "admin" } };
    if (verified === "true") query.isVerifiedBadge = true;
    if (verified === "false") query.isVerifiedBadge = false;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── VERIFY A USER MANUALLY ───────────────────────────
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "verified",
        isVerifiedBadge: true,
        verificationMethod: "manual_admin",
      },
      { new: true },
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "✅ User verified", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── REJECT A USER ────────────────────────────────────
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "rejected",
        isVerifiedBadge: false,
      },
      { new: true },
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "❌ User rejected", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADD COLLEGE ──────────────────────────────────────
exports.addCollege = async (req, res) => {
  try {
    const College = require("../models/College");
    const college = await College.create(req.body);
    res.status(201).json(college);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADD COMPANY ──────────────────────────────────────
exports.addCompany = async (req, res) => {
  try {
    const Company = require("../models/Company");
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
