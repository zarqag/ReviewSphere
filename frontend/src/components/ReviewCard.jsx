import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import StarRating from "./StarRating";

export default function ReviewCard({ review, onUpvote }) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(review.upvotes);
  const [upvoted, setUpvoted] = useState(review.upvotedBy?.includes(user?._id));
  const [loading, setLoading] = useState(false);

  const handleUpvote = async () => {
    if (!user) return alert("Please login to upvote");
    setLoading(true);
    try {
      const res = await API.post(`/reviews/upvote/${review._id}`);
      setUpvotes(res.data.upvotes);
      setUpvoted(res.data.upvoted);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {review.author?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">
                {review.author?.name}
              </span>
              {review.author?.isVerifiedBadge && (
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  ✔ Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {review.author?.role === "student" &&
                `Student · ${review.author?.college}`}
              {review.author?.role === "alumni" &&
                `Alumni · ${review.author?.college}`}
              {review.author?.role === "professional" &&
                `Professional · ${review.author?.company}`}
              {" · "}
              {timeAgo(review.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>

      {/* Ratings grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {Object.entries(review.ratings || {}).map(([key, val]) =>
          val ? (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 capitalize w-28 shrink-0">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
              <StarRating value={val} readOnly size="sm" />
            </div>
          ) : null,
        )}
      </div>

      {/* Content */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {review.content}
      </p>

      {/* AI Pros & Cons */}
      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {review.pros?.length > 0 && (
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 mb-1">✦ Pros</p>
              {review.pros.map((p, i) => (
                <p key={i} className="text-xs text-green-600">
                  • {p}
                </p>
              ))}
            </div>
          )}
          {review.cons?.length > 0 && (
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs font-bold text-red-600 mb-1">✦ Cons</p>
              {review.cons.map((c, i) => (
                <p key={i} className="text-xs text-red-500">
                  • {c}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Summary */}
      {review.aiSummary && (
        <div className="bg-blue-50 rounded-xl px-4 py-2 mb-4 flex gap-2 items-start">
          <span className="text-blue-400 text-xs font-bold mt-0.5">✦ AI</span>
          <p className="text-xs text-blue-600">{review.aiSummary}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <button
          onClick={handleUpvote}
          disabled={loading}
          className={`flex items-center gap-1.5 text-sm font-medium transition ${
            upvoted ? "text-orange-500" : "text-gray-400 hover:text-orange-500"
          }`}
        >
          <span>{upvoted ? "▲" : "△"}</span>
          <span>{upvotes} Helpful</span>
        </button>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            review.sentiment === "positive"
              ? "bg-green-100 text-green-600"
              : review.sentiment === "negative"
                ? "bg-red-100 text-red-500"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {review.sentiment || "unanalyzed"}
        </span>
      </div>
    </div>
  );
}
