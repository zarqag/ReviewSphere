const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    state: { type: String },
    type: {
      type: String,
      enum: ["IIT", "NIT", "Private", "Government", "Deemed"],
    },
    website: { type: String },
    logo: { type: String },

    // Auto-calculated from reviews
    avgRating: { type: Number, default: 0 },
    avgFaculty: { type: Number, default: 0 },
    avgPlacements: { type: Number, default: 0 },
    avgInfrastructure: { type: Number, default: 0 },
    avgCampusLife: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // AI generated
    worthItScore: { type: Number, default: 0 },
    tags: [String], // e.g. ["Good Placements", "Active Campus"]
  },
  { timestamps: true },
);

module.exports = mongoose.model("College", collegeSchema);
