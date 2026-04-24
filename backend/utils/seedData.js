const mongoose = require("mongoose");
const dotenv = require("dotenv");
const College = require("../models/College");
const Company = require("../models/Company");

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const colleges = [
  { name: "IIT Delhi", location: "New Delhi", state: "Delhi", type: "IIT" },
  { name: "IIT Bombay", location: "Mumbai", state: "Maharashtra", type: "IIT" },
  {
    name: "NIT Trichy",
    location: "Tiruchirappalli",
    state: "Tamil Nadu",
    type: "NIT",
  },
  {
    name: "BITS Pilani",
    location: "Pilani",
    state: "Rajasthan",
    type: "Deemed",
  },
  {
    name: "VIT Vellore",
    location: "Vellore",
    state: "Tamil Nadu",
    type: "Private",
  },
];

const companies = [
  { name: "TCS", industry: "IT", headquarters: "Mumbai" },
  { name: "Infosys", industry: "IT", headquarters: "Bengaluru" },
  { name: "Google", industry: "Tech", headquarters: "Hyderabad" },
  { name: "Microsoft", industry: "Tech", headquarters: "Hyderabad" },
  { name: "Deloitte", industry: "Consulting", headquarters: "Mumbai" },
];

const seed = async () => {
  await College.deleteMany();
  await Company.deleteMany();
  await College.insertMany(colleges);
  await Company.insertMany(companies);
  console.log("✅ Seed data inserted!");
  process.exit();
};

seed();
