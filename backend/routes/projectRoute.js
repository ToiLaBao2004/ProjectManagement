import express from 'express';
import { createProject, getProjects, getProjectById, addMemberToProject, editMemberRole, removeMemberFromProject, 
    getSprintsOfProject, addSprintToProject, removeSprintFromProject, updateProject
 } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';
import taskRouter from './taskRoute.js';

const projectRouter = express.Router({ mergeParams: true });

projectRouter.post('/create', authMiddleware, createProject);
projectRouter.get('/', authMiddleware, getProjects);
projectRouter.get('/:projectId', authMiddleware, getProjectById);
projectRouter.put('/:projectId/add-member', authMiddleware, addMemberToProject);
projectRouter.put('/:projectId/edit-member-role', authMiddleware, editMemberRole);
projectRouter.put('/:projectId/remove-member', authMiddleware, removeMemberFromProject);
projectRouter.get('/:projectId/sprints', authMiddleware, getSprintsOfProject);
projectRouter.post('/:projectId/add-sprint', authMiddleware, addSprintToProject);
projectRouter.put('/:projectId/remove-sprint', authMiddleware, removeSprintFromProject);
projectRouter.put('/:projectId/update', authMiddleware, updateProject);

projectRouter.use('/:projectId/task', taskRouter);

export default projectRouter;