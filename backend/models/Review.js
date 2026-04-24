const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // Who wrote it
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // What they're reviewing
    targetType: {
      type: String,
      enum: ["college", "company"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType", // dynamically refs College or Company
    },

    // Ratings (1-5)
    ratings: {
      // College ratings
      faculty: { type: Number, min: 1, max: 5 },
      placements: { type: Number, min: 1, max: 5 },
      infrastructure: { type: Number, min: 1, max: 5 },
      campusLife: { type: Number, min: 1, max: 5 },
      // Company ratings
      workCulture: { type: Number, min: 1, max: 5 },
      salary: { type: Number, min: 1, max: 5 },
      learningOpportunities: { type: Number, min: 1, max: 5 },
      workLifeBalance: { type: Number, min: 1, max: 5 },
    },

    title: { type: String, required: true },
    content: { type: String, required: true, minlength: 100 },

    // AI-generated (filled after posting)
    sentiment: { type: String, enum: ["positive", "neutral", "negative"] },
    aiSummary: { type: String },
    pros: [String],
    cons: [String],

    // Engagement
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Moderation
    status: {
      type: String,
      enum: ["pending", "approved", "flagged"],
      default: "pending",
    },
    isVerifiedAuthor: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Review", reviewSchema);
