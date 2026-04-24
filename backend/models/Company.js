const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    industry: { type: String }, // e.g. "IT", "Finance", "Consulting"
    website: { type: String },
    logo: { type: String },
    headquarters: { type: String },

    // Auto-calculated from reviews
    avgRating: { type: Number, default: 0 },
    avgWorkCulture: { type: Number, default: 0 },
    avgSalary: { type: Number, default: 0 },
    avgLearning: { type: Number, default: 0 },
    avgWorkLifeBalance: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    tags: [String], // e.g. ["Good Salary", "Toxic Culture"]
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);
