import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import { createNotification } from '../services/notificationService.js'

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
            assigner: assignerUser._id
        });
        await newTask.save();
        await createNotification({
            user: req.user.id,
            type: "task_created",
            title: "Bạn đã tạo một task mới",
            message: `Task "${title}" đã được tạo`,
            task: newTask._id
        });
        if (assignerUser._id.toString() !== req.user.id.toString()) {
            await createNotification({
                user: assignerUser._id,
                type: "task_assigned",
                title: "Bạn được giao một task mới",
                message: `Bạn được giao task "${title}"`,
                task: newTask._id
            });
        }
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
        const oldStatus = task.status;
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
        if (task.status === "completed" && oldStatus !== "completed") {
            await createNotification({
                user: task.owner,
                type: "task_completed",
                title: "Task đã hoàn thành",
                message: `Task "${task.title}" đã được đánh dấu hoàn thành`,
                task: task._id
            });
            if (task.assigner.toString() !== task.owner.toString()) {
                await createNotification({
                    user: task.assigner,
                    type: "task_completed",
                    title: "Task bạn được giao đã hoàn thành",
                    message: `Task "${task.title}" đã hoàn thành`,
                    task: task._id
                });
            }
        } else {
            await createNotification({
                user: task.owner,
                type: "task_updated",
                title: "Task đã được cập nhật",
                message: `Task "${task.title}" đã có thay đổi`,
                task: task._id
            });
            if (task.assigner.toString() !== task.owner.toString()) {
                await createNotification({
                    user: task.assigner,
                    type: "task_updated",
                    title: "Task bạn được giao đã được cập nhật",
                    message: `Task "${task.title}" đã có thay đổi`,
                    task: task._id
                });
            }
        }
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
        if (task.owner.toString() !== userId.toString()){
            await createNotification({
                user: task.owner,
                type: "comment_added",
                title: "Có comment mới trong task",
                message: `Task "${task.title}" vừa có comment: "${content}"`,
                task: task._id
            });
        }
        if (task.assigner.toString() !== task.owner.toString() && task.assigner.toString() !== userId.toString()) {
            await createNotification({
                user: task.assigner,
                type: "comment_added",
                title: "Có comment mới trong task bạn được giao",
                message: `"${content}"`,
                task: task._id
            });
        }
        res.status(201).json({ success: true, task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}