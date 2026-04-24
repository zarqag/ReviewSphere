const express = require("express");
const router = express.Router();
const {
  createCollege,
  getAllColleges,
  getCollege,
  compareColleges,
} = require("../controllers/collegeController");

router.post("/", createCollege);
router.get("/", getAllColleges);
router.get("/compare", compareColleges);
router.get("/:id", getCollege);

module.exports = router;
