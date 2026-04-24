import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message;
      // If unverified, redirect to OTP page
      if (msg === "Please verify your email first") {
        navigate("/verify-otp", {
          state: { userId: err.response.data.userId, email },
        });
      } else {
        setError(msg || "Login failed");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">
          Login to your ReviewSphere account
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@gmail.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{" "}
          <Link
            to="/register"
            className="text-orange-500 font-medium hover:underline"
          >
            Create verified account
          </Link>
        </p>
      </div>
    </div>
  );
}
