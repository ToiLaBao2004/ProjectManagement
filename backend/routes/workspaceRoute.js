import express from 'express';
import { acceptInvite, createWorkspace, getMyWorkspaces, getWorkspaceById, inviteMemberByEmail, updateWorkspace, removeMember, updateMemberRole, deleteWorkspace } from '../controllers/workspaceController.js';
import { authMiddleware } from '../middleware/auth.js';
import projectRouter from './projectRoute.js';

const workspaceRouter = express.Router();

// PRIVATE LINK protected route
workspaceRouter.post('/create', authMiddleware, createWorkspace);
workspaceRouter.get('/my', authMiddleware, getMyWorkspaces);
workspaceRouter.get('/:workspaceId', authMiddleware, getWorkspaceById);
workspaceRouter.put('/:workspaceId/invite', authMiddleware, inviteMemberByEmail);
workspaceRouter.put('/:workspaceId/update', authMiddleware, updateWorkspace);
workspaceRouter.put('/:workspaceId/remove-member', authMiddleware, removeMember);
workspaceRouter.put('/:workspaceId/update-member-role', authMiddleware, updateMemberRole);
workspaceRouter.delete('/:workspaceId/delete', authMiddleware, deleteWorkspace);

// PUBLIC LINK route
workspaceRouter.get('/invite/accept', acceptInvite);

workspaceRouter.use('/:workspaceId/project', projectRouter);

export default workspaceRouter;