const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // Who they are
    role: {
      type: String,
      enum: ["student", "alumni", "professional", "admin"],
      required: true,
    },
    college: { type: String }, // college name
    company: { type: String }, // company name (for professionals)
    graduationYear: { type: Number }, // e.g. 2024
    course: { type: String }, // e.g. "B.Tech CSE"

    // Verification
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ["email_otp", "id_upload", "linkedin"],
    },
    idProofUrl: { type: String }, // uploaded ID card URL
    isVerifiedBadge: { type: Boolean, default: false },

    // OTP fields
    otp: { type: String },
    otpExpiry: { type: Date },

    // Stats
    credibilityScore: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
); // adds createdAt and updatedAt automatically

module.exports = mongoose.model("User", userSchema);
