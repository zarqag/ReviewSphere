import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/colleges?search=${search}`);
      setColleges(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchColleges();
  };

  const renderStars = (rating) => {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Colleges
          </h1>
          <p className="text-gray-500">
            Browse verified student reviews for top colleges in India
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by college name..."
            className="flex-1 border border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition"
          >
            Search
          </button>
        </form>

        {/* College Cards */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">
            Loading colleges...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colleges.map((college) => (
              <Link
                key={college._id}
                to={`/colleges/${college._id}`}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg group-hover:text-orange-500 transition">
                      {college.name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {college.location} · {college.type}
                    </p>
                  </div>
                  <span className="bg-orange-50 text-orange-600 text-sm font-bold px-3 py-1 rounded-full">
                    {college.avgRating > 0
                      ? Number(college.avgRating).toFixed(1)
                      : "New"}
                  </span>
                </div>

                {college.avgRating > 0 && (
                  <div className="text-yellow-400 text-sm mb-3">
                    {renderStars(college.avgRating)}
                  </div>
                )}

                {/* Rating bars */}
                {college.reviewCount > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                    {[
                      ["Faculty", college.avgFaculty],
                      ["Placements", college.avgPlacements],
                      ["Infrastructure", college.avgInfrastructure],
                      ["Campus Life", college.avgCampusLife],
                    ].map(([label, val]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-20 shrink-0">
                          {label}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-orange-400 h-1.5 rounded-full"
                            style={{ width: `${(val / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {college.reviewCount} verified review
                    {college.reviewCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-orange-500 font-medium">
                    View Reviews →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && colleges.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No colleges found. Try a different search.
          </div>
        )}
      </div>
    </div>
  );
}
