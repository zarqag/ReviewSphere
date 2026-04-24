import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    college: "",
    company: "",
    course: "",
    graduationYear: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/register", formData);
      // Go to OTP verification page
      navigate("/verify-otp", {
        state: { userId: res.data.userId, email: formData.email },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Create your account
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Join as a verified student, alumni, or professional
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="rahul@college.ac.in"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use your college email for instant verification
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              <option value="student">Current Student</option>
              <option value="alumni">Alumni</option>
              <option value="professional">Working Professional</option>
            </select>
          </div>

          {/* College (for students/alumni) */}
          {(formData.role === "student" || formData.role === "alumni") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="IIT Delhi"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="B.Tech CSE"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grad Year
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="2026"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
            </>
          )}

          {/* Company (for professionals) */}
          {formData.role === "professional" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Google, TCS, Infosys..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account & Get OTP →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-500 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
