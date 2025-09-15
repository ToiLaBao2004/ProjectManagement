import jwt from "jsonwebtoken";

// [GET] /auth/google/callback
export const googleCallback = (req, res) => {
  try {
    // Tạo JWT
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Trả về JSON (hoặc redirect sang FE nếu có)
    return res.json({
      success: true,
      token,
      user: { id: req.user._id, name: req.user.name, email: req.user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};