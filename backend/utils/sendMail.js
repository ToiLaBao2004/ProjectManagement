import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // dùng Gmail, có thể đổi sang SMTP khác
  auth: {
    user: process.env.EMAIL_USER, // email gửi đi
    pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng (App password, không phải mật khẩu Gmail thường)
  },
});

/**
 * Gửi email
 * @param {string} to - email người nhận
 * @param {string} subject - tiêu đề email
 * @param {string} html - nội dung (có thể dùng HTML)
 */
export default async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}