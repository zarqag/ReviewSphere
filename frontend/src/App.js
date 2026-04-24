import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Colleges from "./pages/Colleges";
import CollegeDetail from "./pages/CollegeDetail";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Compare from "./pages/Compare";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/colleges/:id" element={<CollegeDetail />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
