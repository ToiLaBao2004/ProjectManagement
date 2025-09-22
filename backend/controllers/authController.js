import jwt from "jsonwebtoken";

// [GET] /auth/google/callback
export const googleCallback = (req, res) => {
  try {
    // Tạo JWT
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Encode user data cho URL
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    };
    
    const encodedUser = encodeURIComponent(JSON.stringify(userData));

    // Redirect về frontend với token và user data trong query params
    const redirectUrl = `http://localhost:5173?token=${token}&user=${encodedUser}`;
    return res.redirect(redirectUrl);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};