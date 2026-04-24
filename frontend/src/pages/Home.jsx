import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
        Real reviews from
        <br />
        <span className="text-orange-500">real students</span>
      </h1>
      <p className="text-gray-500 text-lg max-w-xl mb-8">
        Verified college students and professionals share honest insights so
        12th graders and juniors can make better decisions.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          to="/colleges"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          Browse Colleges
        </Link>
        {!user && (
          <Link
            to="/register"
            className="border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold px-8 py-3 rounded-full transition"
          >
            Write a Review
          </Link>
        )}
      </div>
    </div>
  );
}
