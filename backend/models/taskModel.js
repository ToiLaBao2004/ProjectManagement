import mongoose from "mongoose";
import commentSchema from "./commentModel.js";
import historySchema from "./historyTaskModel.js";
import NotificationModel from './notificationModel.js';

const taskSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    sprint: { type: mongoose.Schema.Types.ObjectId},
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    dueDate: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [commentSchema],
    history: [historySchema],
}, { timestamps: true });

taskSchema.pre('save', async function (next) {
    try {
        // Chỉ check khi task mới hoặc các field quan trọng thay đổi
        if (!this.isNew && !this.isModified('title') && !this.isModified('project') && !this.isModified('sprint')) {
            return next();
        }

        const query = {
            project: this.project,
            title: this.title,
        };

        if (this.sprint) {
            query.sprint = this.sprint;
        } else {
            query.sprint = { $in: [null, undefined] };
        }

        const existingTask = await mongoose.models.Task.findOne(query);

        if (existingTask && existingTask._id.toString() !== this._id.toString()) {
            return next(new Error('Task title must be unique within the same project and sprint'));
        }

        next();
    } catch (err) {
        next(err);
    }
});

// Document middleware
taskSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        await NotificationModel.deleteMany({ task: this._id });
        next();
    } catch (err) {
        next(err);
    }
});

// Query middleware
taskSchema.pre('deleteMany', { document: false, query: true }, async function(next) {
    try {
        const filter = this.getFilter();
        const tasks = await mongoose.models.Task.find(filter);
        for (const task of tasks) {
            await task.deleteOne();
        }
        next();
    } catch (err) {
        next(err);
    }
});

const TaskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default TaskModel;