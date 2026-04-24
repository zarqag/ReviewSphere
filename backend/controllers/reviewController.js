const Review = require("../models/Review");
const College = require("../models/College");
const Company = require("../models/Company");
const { analyzeReview } = require("../utils/aiService");

// ─── POST A REVIEW ───────────────────────────────────────
exports.createReview = async (req, res) => {
  try {
    const { targetType, targetId, ratings, title, content } = req.body;

    // Check if user already reviewed this college/company
    const existing = await Review.findOne({
      author: req.user._id,
      targetType,
      targetId,
    });
    if (existing) {
      return res.status(400).json({
        message:
          "You have already reviewed this. You can edit your existing review.",
      });
    }

    // Create the review
    // Save review first
    const review = await Review.create({
      author: req.user._id,
      targetType,
      targetId,
      ratings,
      title,
      content,
      isVerifiedAuthor: req.user.isVerifiedBadge,
      status: "approved",
    });

    // Run AI analysis in background (don't await — keeps response fast)
    analyzeReview(content)
      .then(async (aiResult) => {
        await Review.findByIdAndUpdate(review._id, {
          sentiment: aiResult.sentiment,
          aiSummary: aiResult.summary,
          pros: aiResult.pros,
          cons: aiResult.cons,
        });
        console.log(
          `✅ AI analyzed review ${review._id}: ${aiResult.sentiment}`,
        );
      })
      .catch((err) => {
        console.error("AI background analysis failed:", err.message);
      });

    // Update average ratings on the college/company
    await updateAverageRatings(targetType, targetId);

    // Update user's review count
    req.user.reviewCount += 1;
    req.user.credibilityScore += 10; // reward for posting
    await req.user.save();

    res.status(201).json({
      message: "✅ Review posted successfully!",
      review,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL REVIEWS FOR A COLLEGE OR COMPANY ────────────
exports.getReviews = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { sort = "latest", page = 1, limit = 10 } = req.query;

    // Sorting options
    const sortOptions = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      most_helpful: { upvotes: -1 },
      highest: { "ratings.overall": -1 },
    };

    const reviews = await Review.find({
      targetType,
      targetId,
      status: "approved",
    })
      .populate(
        "author",
        "name role college company isVerifiedBadge credibilityScore",
      )
      .sort(sortOptions[sort] || sortOptions.latest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments({
      targetType,
      targetId,
      status: "approved",
    });

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET A SINGLE REVIEW ─────────────────────────────────
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "author",
      "name role college company isVerifiedBadge",
    );

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── UPVOTE A REVIEW ─────────────────────────────────────
exports.upvoteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const userId = req.user._id.toString();
    const alreadyUpvoted = review.upvotedBy
      .map((id) => id.toString())
      .includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote (toggle off)
      review.upvotedBy = review.upvotedBy.filter(
        (id) => id.toString() !== userId,
      );
      review.upvotes -= 1;
    } else {
      // Add upvote
      review.upvotedBy.push(req.user._id);
      review.upvotes += 1;
    }

    await review.save();
    res.json({
      upvotes: review.upvotes,
      upvoted: !alreadyUpvoted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── EDIT A REVIEW ───────────────────────────────────────
exports.editReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only the author can edit
    if (review.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own reviews" });
    }

    const { ratings, title, content } = req.body;
    review.ratings = ratings || review.ratings;
    review.title = title || review.title;
    review.content = content || review.content;
    await review.save();

    // Recalculate averages
    await updateAverageRatings(review.targetType, review.targetId);

    res.json({ message: "Review updated", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE A REVIEW ─────────────────────────────────────
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reviews" });
    }

    await review.deleteOne();
    await updateAverageRatings(review.targetType, review.targetId);

    res.json({ message: "🗑️ Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET MY REVIEWS ──────────────────────────────────────
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ author: req.user._id })
      .populate("targetId", "name location")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── HELPER: Recalculate average ratings ─────────────────
const updateAverageRatings = async (targetType, targetId) => {
  const reviews = await Review.find({
    targetType,
    targetId,
    status: "approved",
  });

  if (reviews.length === 0) return;

  const Model = targetType === "college" ? College : Company;

  if (targetType === "college") {
    const avg = (field) => {
      const vals = reviews.map((r) => r.ratings[field]).filter(Boolean);
      return vals.length
        ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
        : 0;
    };
    await Model.findByIdAndUpdate(targetId, {
      avgFaculty: avg("faculty"),
      avgPlacements: avg("placements"),
      avgInfrastructure: avg("infrastructure"),
      avgCampusLife: avg("campusLife"),
      avgRating: (
        [
          avg("faculty"),
          avg("placements"),
          avg("infrastructure"),
          avg("campusLife"),
        ].reduce((a, b) => Number(a) + Number(b), 0) / 4
      ).toFixed(1),
      reviewCount: reviews.length,
    });
  } else {
    const avg = (field) => {
      const vals = reviews.map((r) => r.ratings[field]).filter(Boolean);
      return vals.length
        ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
        : 0;
    };
    await Model.findByIdAndUpdate(targetId, {
      avgWorkCulture: avg("workCulture"),
      avgSalary: avg("salary"),
      avgLearning: avg("learningOpportunities"),
      avgWorkLifeBalance: avg("workLifeBalance"),
      avgRating: (
        [
          avg("workCulture"),
          avg("salary"),
          avg("learningOpportunities"),
          avg("workLifeBalance"),
        ].reduce((a, b) => Number(a) + Number(b), 0) / 4
      ).toFixed(1),
      reviewCount: reviews.length,
    });
  }
};

// ─── AI Q&A ──────────────────────────────────────────────
exports.askAI = async (req, res) => {
  try {
    const { question, targetType, targetId } = req.body;

    // Fetch recent reviews for context
    const reviews = await Review.find({
      targetType,
      targetId,
      status: "approved",
    })
      .limit(10)
      .select("content title ratings sentiment");

    if (reviews.length === 0) {
      return res.json({
        answer:
          "Not enough reviews yet to answer this question. Be the first to review!",
      });
    }

    // Build context from reviews
    const reviewContext = reviews
      .map((r, i) => `Review ${i + 1}: ${r.content}`)
      .join("\n\n");

    const OpenAI = require("openai");
    const client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const response = await client.chat.completions.create({
      model: "google/gemma-3-4b-it",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are a helpful assistant that answers questions about colleges and companies based on student reviews.

Be honest, concise, and base your answer ONLY on the reviews provided.
Answer in 2-4 sentences. Do not make up information.

Question: "${question}"

Student Reviews:
${reviewContext}`,
        },
      ],
    });

    const answer = response.choices[0].message.content.trim();

    res.json({ answer, basedOn: reviews.length });
  } catch (err) {
    console.error("❌ NVIDIA Q&A failed:", err.message);
    res.status(500).json({ message: "AI service failed. Try again." });
  }
};

// ─── GET ANALYTICS FOR A COLLEGE OR COMPANY ──────────
exports.getAnalytics = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reviews = await Review.find({
      targetType,
      targetId,
      status: "approved",
    });

    if (reviews.length === 0) {
      return res.json({
        total: 0,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        monthlyTrend: [],
      });
    }

    // Sentiment counts
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    reviews.forEach((r) => {
      if (r.sentiment) sentiment[r.sentiment]++;
    });

    // Rating distribution (1-5 stars)
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const vals = Object.values(r.ratings).filter(Boolean);
      if (vals.length) {
        const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        ratingDistribution[avg]++;
      }
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      const count = reviews.filter((r) => {
        const d = new Date(r.createdAt);
        return (
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      }).length;
      monthlyTrend.push({ month, count });
    }

    res.json({
      total: reviews.length,
      sentiment,
      ratingDistribution,
      monthlyTrend,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
