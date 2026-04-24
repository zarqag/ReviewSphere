const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes — must be logged in
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Not logged in. Please log in first." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user)
      return res.status(401).json({ message: "User no longer exists" });

    next();
  } catch (err) {
    res
      .status(401)
      .json({ message: "Invalid or expired token. Please log in again." });
  }
};

// Only verified users can post reviews
exports.verifiedOnly = (req, res, next) => {
  if (!req.user.isVerifiedBadge) {
    return res.status(403).json({
      message:
        "Only verified users can post reviews. Please verify your identity first.",
    });
  }
  next();
};

// Only admins (future use)
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
