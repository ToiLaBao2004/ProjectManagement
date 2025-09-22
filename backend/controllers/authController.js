import jwt from "jsonwebtoken";

// [GET] /auth/google/callback
export const googleCallback = (req, res) => {
  try {
    // Tạo JWT
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Redirect về frontend với token và user data
    const userData = {
      token,
      user: { id: req.user._id, name: req.user.name, email: req.user.email }
    };
    
    // Encode user data để truyền qua URL
    const encodedData = encodeURIComponent(JSON.stringify(userData));
    
    // Redirect về frontend callback page với data (sử dụng biến môi trường)
    return res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?data=${encodedData}`);
  } catch (error) {
    console.error(error);
    // Redirect về login page với error (sử dụng biến môi trường)
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
  }
};