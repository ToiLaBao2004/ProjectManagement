import express from 'express';
import { createTask, getTasksByProject, updateTask, getTaskByUserAssigner, makeComment } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/auth.js';

export const taskRouter = express.Router({ mergeParams: true });

// nested route: :projectId/task
taskRouter.post('/create', authMiddleware, createTask);
taskRouter.get('/', authMiddleware, getTasksByProject);

// standalone route: /task
taskRouter.get('/assigner', authMiddleware, getTaskByUserAssigner);
taskRouter.put('/:taskId/update', authMiddleware, updateTask);
taskRouter.post('/:taskId/comment', authMiddleware, makeComment);

export default taskRouter;