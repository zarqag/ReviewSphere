const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (toEmail, otp) => {
  await transporter.sendMail({
    from: '"ReviewSphere" <noreply@reviewsphere.com>',
    to: toEmail,
    subject: "🔐 Your ReviewSphere Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2 style="color: #e85d26;">Verify your identity</h2>
        <p>Your OTP is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                    background: #f5f2eb; padding: 20px; text-align: center; 
                    border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #999;">Expires in 10 minutes.</p>
      </div>
    `,
  });
};

module.exports = { sendOTP };
