import express from 'express';
import { createTask, getTasksByProject, updateTask, getTaskByUserAssigner, makeComment, getTaskDetail, deleteTask,
    getTasksBySprint
 } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/auth.js';

export const taskRouter = express.Router({ mergeParams: true });

// nested route: :projectId/task
taskRouter.post('/create', authMiddleware, createTask);
taskRouter.get('/', authMiddleware, getTasksByProject);
taskRouter.delete('/delete', authMiddleware, deleteTask);
taskRouter.get('/sprint/:sprintId', authMiddleware, getTasksBySprint);

// standalone route: /task
taskRouter.get('/task/assigner', authMiddleware, getTaskByUserAssigner);
taskRouter.put('/:taskId/update', authMiddleware, updateTask);
taskRouter.post('/:taskId/comment', authMiddleware, makeComment);
taskRouter.get('/task/:taskId', authMiddleware, getTaskDetail);

export default taskRouter;