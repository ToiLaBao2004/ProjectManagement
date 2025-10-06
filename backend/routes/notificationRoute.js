import express from 'express';
import { loadNotification, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const notificationRouter = express.Router();

notificationRouter.get('/my', authMiddleware, loadNotification);
notificationRouter.put('/mark-as-read', authMiddleware, markAsRead);
notificationRouter.put('/mark-all-read', authMiddleware, markAllAsRead);

export default notificationRouter;