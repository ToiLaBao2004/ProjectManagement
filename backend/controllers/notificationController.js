import Notification from '../models/notificationModel.js'

export async function loadNotification(req, res) {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function markAsRead(req, res) {
    try {
        const { notificationId } = req.body;
        const notification = await Notification.findOne({ _id: notificationId, user: req.user.id });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.isRead = true;
        await notification.save();
        return res.status(200).json({ sucess: true, notification })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}