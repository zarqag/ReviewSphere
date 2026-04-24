const express = require("express");
const router = express.Router();
const {
  createCompany,
  getAllCompanies,
  getCompany,
  compareCompanies,
} = require("../controllers/companyController");

router.post("/", createCompany);
router.get("/", getAllCompanies);
router.get("/compare", compareCompanies);
router.get("/:id", getCompany);

module.exports = router;
