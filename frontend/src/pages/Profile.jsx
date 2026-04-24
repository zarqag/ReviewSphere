import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [editMode, setEditMode] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    name: user?.name || "",
    college: user?.college || "",
    company: user?.company || "",
    course: user?.course || "",
    graduationYear: user?.graduationYear || "",
  });

  // Password form state
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  // Fetch my reviews
  useEffect(() => {
    if (tab === "reviews") fetchMyReviews();
  }, [tab]);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const res = await API.get("/reviews/my/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/auth/update-profile", form);
      // Update local auth context
      login({ ...user, ...res.data.user }, localStorage.getItem("rsToken"));
      setEditMode(false);
      showMsg("✅ Profile updated successfully!");
    } catch (err) {
      showMsg(err.response?.data?.message || "Update failed", "error");
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showMsg("New passwords do not match", "error");
      return;
    }
    if (passForm.newPassword.length < 6) {
      showMsg("Password must be at least 6 characters", "error");
      return;
    }
    try {
      await API.put("/auth/change-password", {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      showMsg("✅ Password changed!");
      setPassForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed", "error");
    }
  };

  // Delete own review
  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await API.delete(`/reviews/${id}`);
      showMsg("🗑️ Review deleted");
      fetchMyReviews();
    } catch (err) {
      showMsg("Failed to delete", "error");
    }
  };

  const tabs = [
    { id: "overview", label: "👤 Overview" },
    { id: "reviews", label: "📝 My Reviews" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  const roleLabel = {
    student: "🎓 Current Student",
    alumni: "🏛️ Alumni",
    professional: "💼 Working Professional",
    admin: "🛡️ Admin",
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Toast */}
        {msg.text && (
          <div
            className={`fixed top-24 right-6 px-5 py-3 rounded-xl text-sm font-medium z-50 shadow-lg text-white ${
              msg.type === "error" ? "bg-red-500" : "bg-gray-900"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* ── Profile Hero ──────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-orange-500 text-white text-2xl font-bold flex items-center justify-center flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  {user.isVerifiedBadge && (
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                      ✔ Verified
                    </span>
                  )}
                  {!user.isVerifiedBadge && (
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                      ⏳ Pending Verification
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {roleLabel[user.role]}
                  {user.college && ` · ${user.college}`}
                  {user.company && ` · ${user.company}`}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {user.reviewCount || 0}
                </p>
                <p className="text-xs text-gray-400">Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {user.credibilityScore || 0}
                </p>
                <p className="text-xs text-gray-400">Credibility</p>
              </div>
            </div>
          </div>

          {/* Verification status bar */}
          {!user.isVerifiedBadge && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-700">
                  Your account is pending verification
                </p>
                <p className="text-xs text-yellow-500 mt-0.5">
                  Admin will verify your account within 24 hours
                </p>
              </div>
              <span className="text-2xl">⏳</span>
            </div>
          )}
        </div>

        {/* ── Tabs ─────────────────────────────────── */}
        <div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.id
                  ? "bg-orange-500 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-4">
            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-sm text-orange-500 font-medium hover:underline"
                >
                  {editMode ? "Cancel" : "✏️ Edit"}
                </button>
              </div>

              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: user.name },
                    { label: "Email", value: user.email },
                    { label: "Role", value: roleLabel[user.role] },
                    { label: "College", value: user.college || "—" },
                    { label: "Company", value: user.company || "—" },
                    { label: "Course", value: user.course || "—" },
                    {
                      label: "Graduation Year",
                      value: user.graduationYear || "—",
                    },
                    { label: "Verification", value: user.verificationStatus },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">
                        {label}
                      </p>
                      <p className="text-sm text-gray-800 font-medium capitalize">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        College
                      </label>
                      <input
                        type="text"
                        value={form.college}
                        onChange={(e) =>
                          setForm({ ...form, college: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) =>
                          setForm({ ...form, company: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Course
                      </label>
                      <input
                        type="text"
                        value={form.course}
                        onChange={(e) =>
                          setForm({ ...form, course: e.target.value })
                        }
                        placeholder="B.Tech CSE"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        value={form.graduationYear}
                        onChange={(e) =>
                          setForm({ ...form, graduationYear: e.target.value })
                        }
                        placeholder="2026"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition text-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Credibility Score Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">
                Credibility Score
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-orange-500">
                  {user.credibilityScore || 0}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-full h-3 mb-2">
                    <div
                      className="bg-orange-400 h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(user.credibilityScore || 0, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    +10 points per review posted · +2 per upvote received
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MY REVIEWS TAB ───────────────────────── */}
        {tab === "reviews" && (
          <div>
            {loading ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-3xl mb-2">⏳</div>
                Loading your reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-600 font-semibold mb-2">
                  You haven't written any reviews yet
                </p>
                <p className="text-gray-400 text-sm mb-5">
                  Share your experience to help others make better decisions
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    to="/colleges"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
                  >
                    Review a College
                  </Link>
                  <Link
                    to="/companies"
                    className="border border-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    Review a Company
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}{" "}
                  written
                </p>
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Target info */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              review.targetType === "college"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {review.targetType === "college" ? "🎓" : "🏢"}{" "}
                            {review.targetType}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {review.targetId?.name || "Unknown"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              review.status === "approved"
                                ? "bg-green-100 text-green-600"
                                : review.status === "flagged"
                                  ? "bg-red-100 text-red-500"
                                  : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {review.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1">
                          {review.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {review.content}
                        </p>

                        {/* Ratings */}
                        <div className="flex gap-4 flex-wrap">
                          {Object.entries(review.ratings || {}).map(
                            ([key, val]) =>
                              val ? (
                                <div
                                  key={key}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-xs text-gray-400 capitalize">
                                    {key.replace(/([A-Z])/g, " $1")}:
                                  </span>
                                  <span className="text-xs font-bold text-yellow-500">
                                    {"★".repeat(val)}
                                    {"☆".repeat(5 - val)}
                                  </span>
                                </div>
                              ) : null,
                          )}
                        </div>

                        {/* AI tags */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {review.sentiment && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                review.sentiment === "positive"
                                  ? "bg-green-100 text-green-600"
                                  : review.sentiment === "negative"
                                    ? "bg-red-100 text-red-500"
                                    : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {review.sentiment}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            👍 {review.upvotes} upvotes
                          </span>
                          <span className="text-xs text-gray-300">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link
                          to={`/${review.targetType}s/${review.targetId?._id}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition text-center"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────────────── */}
        {tab === "settings" && (
          <div className="space-y-4">
            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">
                🔐 Change Password
              </h2>
              <form
                onSubmit={handleChangePassword}
                className="space-y-3 max-w-md"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passForm.currentPassword}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passForm.newPassword}
                    onChange={(e) =>
                      setPassForm({ ...passForm, newPassword: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passForm.confirmPassword}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Repeat new password"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
                >
                  Change Password
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-100 p-6">
              <h2 className="font-bold text-red-500 mb-1">⚠️ Danger Zone</h2>
              <p className="text-sm text-gray-400 mb-4">
                These actions are permanent and cannot be undone.
              </p>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to logout?")) {
                    logout();
                    navigate("/");
                  }
                }}
                className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 font-medium px-5 py-2.5 rounded-lg text-sm transition"
              >
                Logout from all devices
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
