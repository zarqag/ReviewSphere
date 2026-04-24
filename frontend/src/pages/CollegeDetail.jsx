import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import ReviewCard from "../components/ReviewCard";
import WriteReview from "../components/WriteReview";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import { RatingBarChart, SentimentChart } from "../components/RatingChart";

export default function CollegeDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  // ── All state must be inside the component ──────────
  const [college, setCollege] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sort, setSort] = useState("latest");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ── Fetch functions ──────────────────────────────────
  const fetchCollege = async () => {
    try {
      const res = await API.get(`/colleges/${id}`);
      setCollege(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/reviews/college/${id}?sort=${sort}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get(`/reviews/analytics/college/${id}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const res = await API.post("/reviews/ask-ai", {
        question: aiQuestion,
        targetType: "college",
        targetId: id,
      });
      setAiAnswer(res.data.answer);
    } catch (err) {
      setAiAnswer("Sorry, could not get an answer right now.");
    }
    setAiLoading(false);
  };

  // ── Effects ──────────────────────────────────────────
  useEffect(() => {
    fetchCollege();
    fetchAnalytics();
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [id, sort]);

  // ── Loading ──────────────────────────────────────────
  if (!college)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-gray-400">Loading college details...</p>
        </div>
      </div>
    );

  const ratingBars = [
    { label: "Faculty", value: college.avgFaculty },
    { label: "Placements", value: college.avgPlacements },
    { label: "Infrastructure", value: college.avgInfrastructure },
    { label: "Campus Life", value: college.avgCampusLife },
  ];

  const suggestedQuestions = [
    "Is this good for placements?",
    "How is the faculty quality?",
    "What is campus life like?",
    "Is infrastructure good?",
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* ── Hero Banner ─────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-3 py-1 rounded-full">
                {college.type}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-1">
                {college.name}
              </h1>
              <p className="text-gray-400 text-sm mb-4">
                📍 {college.location}, {college.state}
              </p>
              {college.avgRating > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {Number(college.avgRating).toFixed(1)}
                  </span>
                  <div>
                    <StarRating
                      value={Math.round(college.avgRating)}
                      readOnly
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Based on {college.reviewCount} verified review
                      {college.reviewCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  No reviews yet — be the first!
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 min-w-[260px]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Rating Breakdown
              </p>
              {ratingBars.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-500 w-24 shrink-0">
                    {label}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((value || 0) / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8 text-right">
                    {value ? Number(value).toFixed(1) : "–"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Analytics Section ────────────────────────── */}
      {analytics && analytics.total > 0 && (
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Analytics
            <span className="text-gray-400 font-normal text-sm ml-2">
              Based on {analytics.total} reviews
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rating Breakdown Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                Rating Breakdown
              </p>
              <RatingBarChart data={college} type="college" />
            </div>

            {/* Sentiment Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                Review Sentiment
              </p>
              <div className="max-w-[200px] mx-auto">
                <SentimentChart
                  positive={analytics.sentiment.positive}
                  neutral={analytics.sentiment.neutral}
                  negative={analytics.sentiment.negative}
                />
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                Rating Distribution
              </p>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = analytics.ratingDistribution[star] || 0;
                const percent = analytics.total
                  ? Math.round((count / analytics.total) * 100)
                  : 0;
                return (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500 w-6">{star}★</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                Reviews Over Time
              </p>
              <div className="flex items-end gap-2 h-24">
                {analytics.monthlyTrend.map(({ month, count }) => {
                  const max = Math.max(
                    ...analytics.monthlyTrend.map((m) => m.count),
                    1,
                  );
                  const height = Math.round((count / max) * 100);
                  return (
                    <div
                      key={month}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-xs text-gray-500">{count}</span>
                      <div
                        className="w-full bg-orange-400 rounded-t-md transition-all"
                        style={{
                          height: `${height}%`,
                          minHeight: count > 0 ? "4px" : "0",
                        }}
                      />
                      <span className="text-xs text-gray-400">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Q&A Box ───────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-500 text-lg">✦</span>
            <h3 className="font-bold text-gray-900">
              Ask AI about this college
            </h3>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              Based on student reviews
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4 ml-6">
            AI answers your question using real verified reviews
          </p>
          <form onSubmit={handleAskAI} className="flex gap-3 mb-3">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="e.g. Is this college good for placements?"
              className="flex-1 border border-blue-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuestion.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap"
            >
              {aiLoading ? "⏳ Thinking..." : "✦ Ask AI"}
            </button>
          </form>
          <div className="flex gap-2 flex-wrap mb-4">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAiQuestion(q)}
                className="text-xs bg-white text-blue-500 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-50 transition"
              >
                {q}
              </button>
            ))}
          </div>
          {aiLoading && (
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-400">
                <span className="animate-pulse">✦</span>
                <p className="text-sm">AI is reading through reviews...</p>
              </div>
            </div>
          )}
          {aiAnswer && !aiLoading && (
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold text-sm mt-0.5">
                  ✦
                </span>
                <div>
                  <p className="text-xs text-blue-400 font-semibold mb-1">
                    AI Answer
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiAnswer}
                  </p>
                  <p className="text-xs text-gray-300 mt-2">
                    Based on {college.reviewCount} student reviews
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews Section ──────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Student Reviews
            <span className="text-gray-400 font-normal text-base ml-2">
              ({college.reviewCount})
            </span>
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
            >
              <option value="latest">Latest</option>
              <option value="most_helpful">Most Helpful</option>
              <option value="highest">Highest Rated</option>
            </select>
            <button
              onClick={() =>
                user ? setShowModal(true) : (window.location.href = "/login")
              }
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition"
            >
              + Write a Review
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-3xl mb-2">⏳</div>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-600 font-semibold mb-1">No reviews yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Be the first verified student to review this college
            </p>
            <button
              onClick={() =>
                user ? setShowModal(true) : (window.location.href = "/login")
              }
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* ── Write Review Modal ───────────────────────── */}
      {showModal && (
        <WriteReview
          targetType="college"
          targetId={id}
          targetName={college.name}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchReviews();
            fetchCollege();
            fetchAnalytics();
          }}
        />
      )}
    </div>
  );
}
