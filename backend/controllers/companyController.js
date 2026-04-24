const Company = require("../models/Company");

exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const { search, industry, sort = "rating" } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (industry) query.industry = industry;

    const sortOptions = {
      rating: { avgRating: -1 },
      reviews: { reviewCount: -1 },
      name: { name: 1 },
    };

    const companies = await Company.find(query).sort(
      sortOptions[sort] || sortOptions.rating,
    );

    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.compareCompanies = async (req, res) => {
  try {
    const { id1, id2 } = req.query;
    const [company1, company2] = await Promise.all([
      Company.findById(id1),
      Company.findById(id2),
    ]);
    if (!company1 || !company2) {
      return res
        .status(404)
        .json({ message: "One or both companies not found" });
    }
    res.json({ company1, company2 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
