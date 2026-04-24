const College = require("../models/College");

// Add a college (admin use or seeding)
exports.createCollege = async (req, res) => {
  try {
    const college = await College.create(req.body);
    res.status(201).json(college);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all colleges (with search + filter)
exports.getAllColleges = async (req, res) => {
  try {
    const { search, state, type, sort = "rating" } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (state) query.state = state;
    if (type) query.type = type;

    const sortOptions = {
      rating: { avgRating: -1 },
      reviews: { reviewCount: -1 },
      name: { name: 1 },
    };

    const colleges = await College.find(query).sort(
      sortOptions[sort] || sortOptions.rating,
    );

    res.json(colleges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one college
exports.getCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: "College not found" });
    res.json(college);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Compare two colleges
exports.compareColleges = async (req, res) => {
  try {
    const { id1, id2 } = req.query;
    const [college1, college2] = await Promise.all([
      College.findById(id1),
      College.findById(id2),
    ]);
    if (!college1 || !college2) {
      return res
        .status(404)
        .json({ message: "One or both colleges not found" });
    }
    res.json({ college1, college2 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
