import { useState, useEffect } from "react";
import API from "../api";
import StarRating from "../components/StarRating";

export default function Compare() {
  const [type, setType] = useState("college");
  const [list, setList] = useState([]);
  const [selected1, setSelected1] = useState("");
  const [selected2, setSelected2] = useState("");
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch list of colleges or companies
  useEffect(() => {
    const fetch = async () => {
      const res = await API.get(`/${type}s`);
      setList(res.data);
      setSelected1("");
      setSelected2("");
      setData1(null);
      setData2(null);
    };
    fetch();
  }, [type]);

  const handleCompare = async () => {
    if (!selected1 || !selected2) return;
    if (selected1 === selected2) {
      alert("Please select two different " + type + "s");
      return;
    }
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        API.get(`/${type}s/${selected1}`),
        API.get(`/${type}s/${selected2}`),
      ]);
      setData1(res1.data);
      setData2(res2.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Rating fields per type
  const fields =
    type === "college"
      ? [
          { label: "Overall", key: "avgRating" },
          { label: "Faculty", key: "avgFaculty" },
          { label: "Placements", key: "avgPlacements" },
          { label: "Infrastructure", key: "avgInfrastructure" },
          { label: "Campus Life", key: "avgCampusLife" },
        ]
      : [
          { label: "Overall", key: "avgRating" },
          { label: "Work Culture", key: "avgWorkCulture" },
          { label: "Salary", key: "avgSalary" },
          { label: "Learning", key: "avgLearning" },
          { label: "Work-Life Bal", key: "avgWorkLifeBalance" },
        ];

  const getWinner = (key) => {
    if (!data1 || !data2) return null;
    const v1 = Number(data1[key] || 0);
    const v2 = Number(data2[key] || 0);
    if (v1 > v2) return 1;
    if (v2 > v1) return 2;
    return 0; // tie
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compare & Decide
          </h1>
          <p className="text-gray-500">
            Side-by-side comparison based on verified student reviews
          </p>
        </div>

        {/* Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setType("college")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                type === "college"
                  ? "bg-orange-500 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              🎓 Colleges
            </button>
            <button
              onClick={() => setType("company")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                type === "company"
                  ? "bg-orange-500 text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              🏢 Companies
            </button>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select first {type}
            </label>
            <select
              value={selected1}
              onChange={(e) => setSelected1(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Choose {type}...</option>
              {list.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleCompare}
              disabled={!selected1 || !selected2 || loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-40"
            >
              {loading ? "Comparing..." : "Compare →"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select second {type}
            </label>
            <select
              value={selected2}
              onChange={(e) => setSelected2(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Choose {type}...</option>
              {list.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        {data1 && data2 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Names Row */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="p-5 text-center">
                <h2 className="font-bold text-gray-900">{data1.name}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {data1.location || data1.headquarters}
                </p>
                <p className="text-xs text-gray-400">
                  {data1.reviewCount} reviews
                </p>
              </div>
              <div className="p-5 text-center border-x border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  vs
                </p>
              </div>
              <div className="p-5 text-center">
                <h2 className="font-bold text-gray-900">{data2.name}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {data2.location || data2.headquarters}
                </p>
                <p className="text-xs text-gray-400">
                  {data2.reviewCount} reviews
                </p>
              </div>
            </div>

            {/* Rating Rows */}
            {fields.map(({ label, key }) => {
              const winner = getWinner(key);
              const val1 = Number(data1[key] || 0);
              const val2 = Number(data2[key] || 0);
              return (
                <div
                  key={key}
                  className="grid grid-cols-3 border-b border-gray-50 hover:bg-gray-50 transition"
                >
                  {/* Value 1 */}
                  <div
                    className={`p-5 flex flex-col items-center justify-center ${
                      winner === 1 ? "bg-green-50" : ""
                    }`}
                  >
                    <span
                      className={`text-2xl font-bold ${
                        winner === 1 ? "text-green-600" : "text-gray-700"
                      }`}
                    >
                      {val1 > 0 ? val1.toFixed(1) : "–"}
                    </span>
                    {val1 > 0 && (
                      <StarRating value={Math.round(val1)} readOnly size="sm" />
                    )}
                    {winner === 1 && (
                      <span className="text-xs text-green-600 font-bold mt-1">
                        ✓ Better
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="p-5 flex items-center justify-center border-x border-gray-100">
                    <span className="text-sm font-semibold text-gray-600 text-center">
                      {label}
                    </span>
                  </div>

                  {/* Value 2 */}
                  <div
                    className={`p-5 flex flex-col items-center justify-center ${
                      winner === 2 ? "bg-green-50" : ""
                    }`}
                  >
                    <span
                      className={`text-2xl font-bold ${
                        winner === 2 ? "text-green-600" : "text-gray-700"
                      }`}
                    >
                      {val2 > 0 ? val2.toFixed(1) : "–"}
                    </span>
                    {val2 > 0 && (
                      <StarRating value={Math.round(val2)} readOnly size="sm" />
                    )}
                    {winner === 2 && (
                      <span className="text-xs text-green-600 font-bold mt-1">
                        ✓ Better
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Winner Banner */}
            <div className="p-5 bg-orange-50 text-center">
              {(() => {
                let score1 = 0,
                  score2 = 0;
                fields.forEach(({ key }) => {
                  const w = getWinner(key);
                  if (w === 1) score1++;
                  if (w === 2) score2++;
                });
                if (score1 > score2)
                  return (
                    <p className="text-orange-600 font-bold">
                      🏆 {data1.name} wins in {score1} out of {fields.length}{" "}
                      categories
                    </p>
                  );
                if (score2 > score1)
                  return (
                    <p className="text-orange-600 font-bold">
                      🏆 {data2.name} wins in {score2} out of {fields.length}{" "}
                      categories
                    </p>
                  );
                return (
                  <p className="text-orange-600 font-bold">
                    🤝 It's a tie! Both are equally rated
                  </p>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
