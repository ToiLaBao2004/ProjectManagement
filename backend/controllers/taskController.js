import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import { createNotification } from '../services/notificationService.js'
import mongoose from 'mongoose';

export async function createTask(req, res) {
    try {
        const { projectId } = req.params;
        const { title, description, priority, status, dueDate, assigner, sprintId } = req.body;
        const userId = req.user.id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const assignerUser = await User.findById(assigner);
        if (!assignerUser) {
            return res.status(404).json({ message: 'Assigner not found' });
        }

        // Nếu có sprintId thì kiểm tra sprint có trong project không
        if (sprintId) {
            const sprint = project.sprints.id(sprintId);
            if (!sprint) {
                return res.status(404).json({ message: 'Sprint not found in this project' });
            }
        }

        const newTask = new Task({
            project: projectId,
            title,
            description,
            priority,
            status,
            dueDate,
            owner: userId,
            assigner: assignerUser._id,
            sprint: sprintId || null
        });

        await newTask.save();

        // Notify người tạo
        await createNotification({
            user: userId,
            type: "task_created",
            title: "Bạn đã tạo một task mới",
            message: `Task "${title}" đã được tạo`,
            task: newTask._id
        });

        // Notify người được assign (nếu khác với owner)
        if (assignerUser._id.toString() !== userId.toString()) {
            await createNotification({
                user: assignerUser._id,
                type: "task_assigned",
                title: "Bạn được giao một task mới",
                message: `Bạn được giao task "${title}"`,
                task: newTask._id
            });
        }

        res.status(201).json({ success: true, newTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function getTasksByProject(req, res) {
    try {
        const { projectId } = req.params;

        // lấy project cùng với danh sách sprint
        const project = await Project.findById(projectId).lean();
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // build sprintMap: { sprintId: sprintName }
        const sprintMap = project.sprints.reduce((acc, sprint) => {
            acc[sprint._id.toString()] = sprint.name;
            return acc;
        }, {});

        // lấy tasks
        const tasks = await Task.find({ project: projectId })
            .populate('owner', 'name email')
            .populate('assigner', 'name email')
            .populate('project', 'name workspace')
            .lean(); // convert thành plain object để dễ merge

        // gắn sprint name vào mỗi task
        const tasksWithSprint = tasks.map(task => {
            const sprintId = task.sprint?.toString();
            return {
                ...task,
                sprint: sprintId
                    ? { _id: sprintId, name: sprintMap[sprintId] || 'Unknown sprint' }
                    : null
            };
        });

        res.status(200).json({ tasks: tasksWithSprint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function getTaskByUserAssigner(req, res) {
    try {
        const userId = req.user.id;

        // lấy tất cả project có liên quan (chứa sprints) để build map
        const projects = await Project.find().lean();
        const sprintMap = {};
        projects.forEach(project => {
            project.sprints.forEach(sprint => {
                sprintMap[sprint._id.toString()] = sprint.name;
            });
        });

        const tasks = await Task.find({ assigner: userId })
            .populate('owner', 'name email')
            .populate('assigner', 'name email')
            .populate('project', 'name workspace')
            .lean();

        const tasksWithSprint = tasks.map(task => {
            const sprintId = task.sprint?.toString();
            return {
                ...task,
                sprint: sprintId
                    ? { _id: sprintId, name: sprintMap[sprintId] || 'Unknown sprint' }
                    : null
            };
        });

        res.status(200).json({ tasks: tasksWithSprint });
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
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const changes = [];
        const oldStatus = task.status;

        Object.keys(updates).forEach((key) => {
            if (updates[key] === "") {
                updates[key] = null;
            }
            let oldValue = task[key];
            let newValue = updates[key];

            if (key === "dueDate") {
                const oldDateStr = oldValue ? oldValue.toISOString().split("T")[0] : null;
                if (oldDateStr === newValue) return; // không thay đổi thì skip
                oldValue = oldValue ? oldValue.toISOString() : null;
                task[key] = newValue ? new Date(newValue) : null;
            } else if (oldValue instanceof Date) {
                oldValue = oldValue.toISOString();
            }

            if (oldValue?.toString() !== newValue?.toString()) {
                changes.push({
                    field: key,
                    oldValue,
                    newValue,
                    updatedBy: userId,
                    updatedAt: new Date()
                });
                if (key !== "dueDate") task[key] = newValue;
            }
        });

        if (changes.length > 0) {
            task.history.push(...changes);
        }

        await task.save();

        // Tạo notification
        const sendUpdateNotification = async (type, user) => {
            await createNotification({
                user,
                type,
                title: type === 'task_completed' ? 'Task đã hoàn thành' : 'Task đã được cập nhật',
                message: `Task "${task.title}" đã có thay đổi`,
                task: task._id
            });
        };

        if (task.status === "completed" && oldStatus !== "completed") {
            await sendUpdateNotification("task_completed", task.owner);
            if (task.assigner.toString() !== task.owner.toString()) {
                await sendUpdateNotification("task_completed", task.assigner);
            }
        } else {
            await sendUpdateNotification("task_updated", task.owner);
            if (task.assigner.toString() !== task.owner.toString()) {
                await sendUpdateNotification("task_updated", task.assigner);
            }
        }

        // Populate updatedBy cho frontend
        await task.populate('history.updatedBy', 'name email');

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
        const updatedTask = await Task.findById(taskId)
            .populate('owner', 'name email')
            .populate('assigner', 'name email')
            .populate('project', 'name workspace')
            .populate('comments.user', 'name email')
            .populate('history.updatedBy', 'name email');
        if (task.owner.toString() !== userId.toString()) {
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
        res.status(201).json({ success: true, task: updatedTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function getTaskDetail(req, res) {
    try {
        const { taskId } = req.params;
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: 'Invalid taskId' });
        }

        let task = await Task.findById(taskId)
            .populate('owner', 'name email')
            .populate('assigner', 'name email')
            .populate('project', 'name workspace sprints') // lấy cả sprint từ project
            .populate('comments.user', 'name email')
            .populate('history.updatedBy', 'name email')
            .lean();

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // build sprintMap từ project chứa task
        const sprintMap = {};
        if (task.project?.sprints) {
            task.project.sprints.forEach(sprint => {
                sprintMap[sprint._id.toString()] = sprint.name;
            });
        }

        // gắn sprint object
        const sprintId = task.sprint?.toString();
        task.sprint = sprintId
            ? { _id: sprintId, name: sprintMap[sprintId] || 'Unknown sprint' }
            : null;

        // sort comments
        if (task.comments?.length > 0) {
            task.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // sort history
        if (task.history?.length > 0) {
            task.history.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error('Error in getTaskDetail:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function deleteTask(req, res) {
    try {
        const { taskId } = req.body; // Assuming taskId is sent in the request body
        const userId = req.user._id; // Authenticated user ID from authMiddleware

        // Validate taskId
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: 'Invalid taskId' });
        }

        // Find the task with populated project
        const task = await Task.findById(taskId).populate('project', 'members');
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check if the user is the task owner
        const isOwner = task.owner.toString() === userId.toString();

        // Check if the user is a project manager
        const isManager = task.project.members.some(
            member => member.user.toString() === userId.toString() && member.role === 'manager'
        );

        // Allow deletion only if the user is the owner or a manager
        if (!isOwner && !isManager) {
            return res.status(403).json({
                success: false,
                message: 'Only the task owner or project manager can delete this task',
            });
        }

        // Delete the task
        await Task.deleteOne();

        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTask:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function getTasksBySprint(req, res) {
    try {
        const { sprintId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sprintId)) {
            return res.status(400).json({ success: false, message: 'Invalid sprintId.' });
        }

        // Lấy tất cả task của sprint
        const tasks = await Task.find({ sprint: sprintId })
            .populate('owner', 'name email')
            .populate('assigner', 'name email')
            .populate('project', 'name workspace sprints') // cần sprints để tìm tên
            .lean();

        if (!tasks.length) {
            return res.status(200).json({ success: true, sprintName: null, tasks: [] });
        }

        // Lấy sprint name từ project.sprints (chỉ cần tìm 1 lần)
        const project = tasks[0].project;
        const sprintObj = project?.sprints?.find(s => s._id.toString() === sprintId);

        const sprintName = sprintObj ? sprintObj.name : null;

        return res.status(200).json({
            success: true,
            sprintName,
            tasks
        });

    } catch (error) {
        console.error('Error in getTasksBySprint:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}