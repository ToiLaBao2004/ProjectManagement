import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Kiểm tra nếu model đã tồn tại để tránh lỗi OverwriteModelError
const userModel = mongoose.model.User || mongoose.model('User', userSchema);

export default userModel;