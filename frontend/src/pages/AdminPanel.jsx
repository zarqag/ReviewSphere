import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // College/Company add form
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [collegeForm, setCollegeForm] = useState({
    name: "",
    location: "",
    state: "",
    type: "Private",
    website: "",
  });
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    headquarters: "",
    website: "",
  });

  // Guard — only admin can access
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user]);

  // Fetch stats
  useEffect(() => {
    if (tab === "dashboard") fetchStats();
    if (tab === "reviews") fetchReviews();
    if (tab === "users") fetchUsers();
  }, [tab, filter]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const status = filter === "all" ? "" : filter;
      const res = await API.get(`/admin/reviews?status=${status}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  // Review actions
  const approveReview = async (id) => {
    await API.put(`/admin/reviews/${id}/approve`);
    showMsg("✅ Review approved");
    fetchReviews();
    fetchStats();
  };

  const flagReview = async (id) => {
    await API.put(`/admin/reviews/${id}/flag`);
    showMsg("🚩 Review flagged");
    fetchReviews();
    fetchStats();
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    await API.delete(`/admin/reviews/${id}`);
    showMsg("🗑️ Review deleted");
    fetchReviews();
    fetchStats();
  };

  // User actions
  const verifyUser = async (id) => {
    await API.put(`/admin/users/${id}/verify`);
    showMsg("✅ User verified");
    fetchUsers();
  };

  const rejectUser = async (id) => {
    await API.put(`/admin/users/${id}/reject`);
    showMsg("❌ User rejected");
    fetchUsers();
  };

  // Add college
  const handleAddCollege = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/colleges", collegeForm);
      showMsg("✅ College added!");
      setShowAddCollege(false);
      setCollegeForm({
        name: "",
        location: "",
        state: "",
        type: "Private",
        website: "",
      });
    } catch (err) {
      showMsg("❌ Failed to add college");
    }
  };

  // Add company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/companies", companyForm);
      showMsg("✅ Company added!");
      setShowAddCompany(false);
      setCompanyForm({ name: "", industry: "", headquarters: "", website: "" });
    } catch (err) {
      showMsg("❌ Failed to add company");
    }
  };

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "reviews", label: "📝 Reviews" },
    { id: "users", label: "👥 Users" },
    { id: "add", label: "➕ Add Data" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-400 text-sm">
              ReviewSphere moderation dashboard
            </p>
          </div>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
            🛡️ Admin Access
          </span>
        </div>

        {/* Toast Message */}
        {msg && (
          <div className="fixed top-24 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium z-50 shadow-lg">
            {msg}
          </div>
        )}

        {/* Tabs */}
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

        {/* ── DASHBOARD TAB ─────────────────────────── */}
        {tab === "dashboard" && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total Users",
                  value: stats.totalUsers,
                  color: "blue",
                },
                {
                  label: "Verified Users",
                  value: stats.verifiedUsers,
                  color: "green",
                },
                {
                  label: "Total Reviews",
                  value: stats.totalReviews,
                  color: "orange",
                },
                {
                  label: "Pending Reviews",
                  value: stats.pendingReviews,
                  color: "yellow",
                },
                {
                  label: "Flagged Reviews",
                  value: stats.flaggedReviews,
                  color: "red",
                },
                {
                  label: "Colleges",
                  value: stats.totalColleges,
                  color: "purple",
                },
                {
                  label: "Companies",
                  value: stats.totalCompanies,
                  color: "indigo",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-100 p-5"
                >
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    {label}
                  </p>
                  <p className={`text-3xl font-bold text-${color}-500`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setTab("reviews")}
                  className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 transition"
                >
                  📋 Review {stats.pendingReviews} pending reviews
                </button>
                <button
                  onClick={() => {
                    setTab("reviews");
                    setFilter("flagged");
                  }}
                  className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  🚩 Check {stats.flaggedReviews} flagged reviews
                </button>
                <button
                  onClick={() => setTab("add")}
                  className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                >
                  ➕ Add College or Company
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS TAB ───────────────────────────── */}
        {tab === "reviews" && (
          <div>
            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {["all", "pending", "approved", "flagged"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    filter === f
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                No reviews found
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Meta */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              review.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : review.status === "flagged"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {review.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            by <strong>{review.author?.name}</strong> (
                            {review.author?.role})
                          </span>
                          {review.author?.isVerifiedBadge && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                              ✔ Verified
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            → {review.targetType}:{" "}
                            <strong>{review.targetId?.name}</strong>
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">
                          {review.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {review.content}
                        </p>

                        {review.sentiment && (
                          <span
                            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
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
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {review.status !== "approved" && (
                          <button
                            onClick={() => approveReview(review._id)}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            ✓ Approve
                          </button>
                        )}
                        {review.status !== "flagged" && (
                          <button
                            onClick={() => flagReview(review._id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            🚩 Flag
                          </button>
                        )}
                        <button
                          onClick={() => deleteReview(review._id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ─────────────────────────────── */}
        {tab === "users" && (
          <div>
            {loading ? (
              <div className="text-center py-20 text-gray-400">
                Loading users...
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {u.name}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                          {u.role}
                        </span>
                        {u.isVerifiedBadge ? (
                          <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
                            ✔ Verified
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{u.email}</p>
                      {u.college && (
                        <p className="text-xs text-gray-400">
                          {u.college} · {u.course}
                        </p>
                      )}
                      {u.company && (
                        <p className="text-xs text-gray-400">{u.company}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {u.reviewCount} reviews · credibility:{" "}
                        {u.credibilityScore}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {!u.isVerifiedBadge && (
                        <button
                          onClick={() => verifyUser(u._id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          ✓ Verify
                        </button>
                      )}
                      {u.isVerifiedBadge && (
                        <button
                          onClick={() => rejectUser(u._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD DATA TAB ──────────────────────────── */}
        {tab === "add" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add College */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">🎓 Add College</h3>
              <form onSubmit={handleAddCollege} className="space-y-3">
                {[
                  { name: "name", placeholder: "College name", required: true },
                  { name: "location", placeholder: "City", required: false },
                  { name: "state", placeholder: "State", required: false },
                  {
                    name: "website",
                    placeholder: "Website URL",
                    required: false,
                  },
                ].map((field) => (
                  <input
                    key={field.name}
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder}
                    value={collegeForm[field.name]}
                    onChange={(e) =>
                      setCollegeForm({
                        ...collegeForm,
                        [field.name]: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                ))}
                <select
                  value={collegeForm.type}
                  onChange={(e) =>
                    setCollegeForm({ ...collegeForm, type: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {["IIT", "NIT", "Private", "Government", "Deemed"].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ),
                  )}
                </select>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Add College
                </button>
              </form>
            </div>

            {/* Add Company */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">🏢 Add Company</h3>
              <form onSubmit={handleAddCompany} className="space-y-3">
                {[
                  { name: "name", placeholder: "Company name", required: true },
                  {
                    name: "industry",
                    placeholder: "Industry (IT, Finance...)",
                    required: false,
                  },
                  {
                    name: "headquarters",
                    placeholder: "Headquarters city",
                    required: false,
                  },
                  {
                    name: "website",
                    placeholder: "Website URL",
                    required: false,
                  },
                ].map((field) => (
                  <input
                    key={field.name}
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder}
                    value={companyForm[field.name]}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        [field.name]: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                ))}
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Add Company
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
