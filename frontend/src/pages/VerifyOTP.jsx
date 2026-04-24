import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export default function VerifyOTP() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/verify-otp", {
        userId: state.userId,
        otp,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await API.post("/auth/resend-otp", { userId: state.userId });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      setError("Could not resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          We sent a 6-digit OTP to <strong>{state?.email}</strong>
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {resent && (
          <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            ✅ New OTP sent!
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue ✓"}
          </button>
        </form>

        <button
          onClick={handleResend}
          className="text-sm text-gray-400 hover:text-gray-600 mt-4 underline"
        >
          Didn't get it? Resend OTP
        </button>
      </div>
    </div>
  );
}
