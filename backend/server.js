const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/colleges", require("./routes/collegeRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "🚀 ReviewSphere API is running!" });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
app.use("/api/admin", require("./routes/adminRoutes"));
