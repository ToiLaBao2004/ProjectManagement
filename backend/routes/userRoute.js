import express from 'express';
import { registerUser, loginUser, getCurrentUser, updateUserProfile, changeUserPassword } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const userRouter = express.Router();

// PUBLIC LINK

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// PRIVATE LINK protected route
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/profile', authMiddleware, updateUserProfile);
userRouter.put('/password', authMiddleware, changeUserPassword);

export default userRouter;