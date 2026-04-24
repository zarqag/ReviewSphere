import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";
import API from "../api";

export default function WriteReview({
  targetType,
  targetId,
  targetName,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Rating fields differ for college vs company
  const ratingFields =
    targetType === "college"
      ? ["faculty", "placements", "infrastructure", "campusLife"]
      : ["workCulture", "salary", "learningOpportunities", "workLifeBalance"];

  const fieldLabels = {
    faculty: "Faculty Quality",
    placements: "Placements",
    infrastructure: "Infrastructure",
    campusLife: "Campus Life",
    workCulture: "Work Culture",
    salary: "Salary & Benefits",
    learningOpportunities: "Learning Opportunities",
    workLifeBalance: "Work-Life Balance",
  };

  const setRating = (field, value) => {
    setRatings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.isVerifiedBadge) {
      setError("Only verified users can post reviews.");
      return;
    }
    if (content.length < 100) {
      setError("Review must be at least 100 characters.");
      return;
    }
    if (ratingFields.some((f) => !ratings[f])) {
      setError("Please rate all categories.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await API.post("/reviews", {
        targetType,
        targetId,
        title,
        content,
        ratings,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post review");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Write a Review</h2>
            <p className="text-sm text-gray-400">{targetName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!user?.isVerifiedBadge && (
            <div className="bg-yellow-50 text-yellow-700 text-sm px-4 py-3 rounded-lg">
              ⚠️ You need a verified account to post reviews.{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="underline font-medium"
              >
                Get verified
              </button>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Great for CSE placements"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Star Ratings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate each category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ratingFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <span className="text-sm text-gray-600">
                    {fieldLabels[field]}
                  </span>
                  <StarRating
                    value={ratings[field] || 0}
                    onChange={(val) => setRating(field, val)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Review
              <span className="text-gray-400 font-normal ml-1">
                (min 100 characters)
              </span>
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your honest experience. What was great? What could be better? Help others make an informed decision..."
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <p
              className={`text-xs mt-1 ${content.length < 100 ? "text-gray-400" : "text-green-500"}`}
            >
              {content.length}/100 minimum characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !user?.isVerifiedBadge}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Review ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
