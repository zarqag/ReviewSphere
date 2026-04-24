import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-900">
          Review<span className="text-orange-500">Sphere</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/colleges"
            className="text-gray-500 hover:text-gray-900 text-sm font-medium transition"
          >
            🎓 Colleges
          </Link>
          <Link
            to="/companies"
            className="text-gray-500 hover:text-gray-900 text-sm font-medium transition"
          >
            🏢 Companies
          </Link>
          <Link
            to="/compare"
            className="text-gray-500 hover:text-gray-900 text-sm font-medium transition"
          >
            ⚖️ Compare
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-red-500 hover:text-red-700 text-sm font-bold transition"
            >
              🛡️ Admin
            </Link>
          )}
          {user && (
            <Link
              to="/profile"
              className="text-gray-500 hover:text-gray-900 text-sm font-medium transition"
            >
              👤 My Profile
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.isVerifiedBadge && (
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full hidden md:block">
                  ✔ Verified
                </span>
              )}
              <span className="text-sm text-gray-600 hidden md:block">
                Hi, {user.name?.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold transition"
              >
                Get Verified →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 z-50">
        <Link to="/" className="flex flex-col items-center gap-0.5">
          <span className="text-lg">🏠</span>
          <span className="text-xs text-gray-500">Home</span>
        </Link>
        <Link to="/colleges" className="flex flex-col items-center gap-0.5">
          <span className="text-lg">🎓</span>
          <span className="text-xs text-gray-500">Colleges</span>
        </Link>
        <Link to="/companies" className="flex flex-col items-center gap-0.5">
          <span className="text-lg">🏢</span>
          <span className="text-xs text-gray-500">Companies</span>
        </Link>
        <Link to="/compare" className="flex flex-col items-center gap-0.5">
          <span className="text-lg">⚖️</span>
          <span className="text-xs text-gray-500">Compare</span>
        </Link>
        {user && (
          <Link to="/profile" className="flex flex-col items-center gap-0.5">
            <span className="text-lg">👤</span>
            <span className="text-xs text-gray-500">Profile</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
