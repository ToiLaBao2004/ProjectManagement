import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['task_created' ,'task_assigned', 'task_updated', 'task_completed', 'task_due_soon', 'comment_added'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true},
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Index để query nhanh theo user và ngày tạo
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const NotificationModel = mongoose.model.Notification || mongoose.model('Notification', notificationSchema);

export default NotificationModel;