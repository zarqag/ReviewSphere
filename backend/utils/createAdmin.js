const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const User = require("../models/User");

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: "admin@reviewsphere.com" });
  if (existing) {
    console.log("⚠️ Admin already exists");
    process.exit();
  }

  const hashed = await bcrypt.hash("admin123", 12);

  await User.create({
    name: "Admin",
    email: "admin@reviewsphere.com",
    password: hashed,
    role: "admin",
    verificationStatus: "verified",
    isVerifiedBadge: true,
  });

  console.log("✅ Admin created!");
  console.log("📧 Email:    admin@reviewsphere.com");
  console.log("🔑 Password: admin123");
  process.exit();
};

createAdmin();
