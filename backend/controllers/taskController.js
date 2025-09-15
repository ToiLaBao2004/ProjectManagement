import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';

export async function createTask(req, res) {
    try {
        const { projectId } = req.params;
        const { title, desciption, priority, 
            status, dueDate, assigner
         } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const assignerUser = await User.findById(assigner);
        if (!assignerUser) {
            return res.status(404).json({ message: 'Assigner not found' });
        }
        const newTask = new Task({
            project: projectId,
            title,
            desciption,
            priority,
            status,
            dueDate,
            owner: req.user.id,
            assigner: assignerUser
        });
        await newTask.save();
        res.status(201).json({ sucess: true, newTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function getTasksByProject(req, res) {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const tasks = await Task.find({ project: projectId });
        res.status(200).json({ tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function getTaskByUserAssigner(req, res) {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({ assigner: userId });
        res.status(200).json({ tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function updateTask(req, res) {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        const userId = req.user.id;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const changes = [];
        Object.keys(updates).forEach((key) => {
            const oldValue = task[key];
            const newValue = updates[key];

            if (oldValue?.toString() !== newValue?.toString()) {
                changes.push({
                    field: key,
                    oldValue,
                    newValue,
                    updatedBy: userId,
                    updatedAt: new Date()
                });
                task[key] = newValue;
            }
        });
        if (changes.length > 0) {
            task.history.push(...changes);
        }
        await task.save();
        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function makeComment(req, res) {
    try {
        const { taskId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const comment = {
            user: userId,
            content,
            createdAt: new Date()
        };
        task.comments.push(comment);
        task.history.push({
            field: 'comments',
            oldValue: null,
            newValue: content,
            updatedBy: userId,
            updatedAt: new Date()
        });
        await task.save();
        res.status(201).json({ success: true, task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}