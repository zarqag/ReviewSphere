const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email config error:", error.message);
  } else {
    console.log("✅ Email server is ready!");
  }
});

transporter.sendMail(
  {
    from: '"ReviewSphere" <noreply@reviewsphere.com>',
    to: "test@example.com",
    subject: "OTP Test",
    text: "Your OTP is 123456",
  },
  (err, info) => {
    if (err) {
      console.log("❌ Send failed:", err.message);
    } else {
      console.log("✅ Test email sent! Check Mailtrap inbox.");
    }
  },
);
