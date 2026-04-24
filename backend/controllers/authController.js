const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP } = require("../utils/sendEmail");

// Helper: generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Helper: generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ─── REGISTER ───────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      college,
      company,
      course,
      graduationYear,
    } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.isVerified) {
        return res.status(400).json({ message: "Email already registered" });
      } else {
        // 👉 resend OTP logic here
        return res.status(200).json({ message: "OTP resent" });
      }
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Create user (unverified for now)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      college,
      company,
      course,
      graduationYear,
      otp,
      otpExpiry,
    });

    // Send OTP email
    await sendOTP(email, otp);

    res.status(201).json({
      message: "Registration successful! OTP sent to your email.",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── VERIFY OTP ─────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    console.log("DB OTP:", user.otp);
    console.log("Entered OTP:", otp);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check OTP match
    if (user.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Mark user as verified
    user.verificationStatus = "verified";
    user.isVerifiedBadge = true;
    user.verificationMethod = "email_otp";
    user.otp = undefined; // clear OTP
    user.otpExpiry = undefined;
    await user.save();

    // Generate token and log them in
    const token = generateToken(user._id);

    res.json({
      message: "✅ Email verified! You are now a verified reviewer.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerifiedBadge: true,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── RESEND OTP ──────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP(user.email, otp);
    res.json({ message: "New OTP sent to your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── LOGIN ───────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with this email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    if (user.verificationStatus === "pending") {
      return res.status(403).json({
        message: "Please verify your email first",
        userId: user._id,
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerifiedBadge: user.isVerifiedBadge,
        college: user.college,
        company: user.company,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET CURRENT USER ────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json(req.user); // req.user is set by auth middleware
};
// ─── UPDATE PROFILE ──────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, college, company, course, graduationYear } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, college, company, course, graduationYear },
      { new: true },
    ).select("-password");

    res.json({ message: "✅ Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CHANGE PASSWORD ─────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "✅ Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
