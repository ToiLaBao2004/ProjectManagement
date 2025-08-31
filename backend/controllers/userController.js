import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const TOKEN_EXPIRES = '24h';

// Hàm tạo token JWT
function createToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

// Hàm đăng ký người dùng mới
export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    // Kiểm tra nếu email đã tồn tại
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use.' });
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        // Tạo người dùng mới
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        // Tạo token xác thực
        const token = createToken(newUser._id);
        res.status(201).json({ success: true, token, newUser: {
            id: newUser._id, name: newUser.name, email: newUser.email
        } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// Hàm đăng nhập người dùng
export async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }
        // Tạo token xác thực
        const token = createToken(user._id);
        res.status(200).json({ success: true, token, user: {
            id: user._id, name: user.name, email: user.email
        } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// Get current user
export async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// Update user profile
export async function updateUserProfile(req, res) {
    const { name, email } = req.body;
    if (!name && !email) {
        return res.status(400).json({ success: false, message: 'All fields is required to update.' });
    }
    try {
        // Kiểm tra nếu email đã tồn tại
        const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already in use.' });
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true , select: "name email"}
        );
        res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// Change user password
export async function changeUserPassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }
    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}