import mongoose from "mongoose";
import sprintSchema from "./sprintModel.js";
import TaskModel from './taskModel.js';

const projectSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ["manager", "developer", "tester"], default: 'developer' },
        joinedAt: { type: Date, default: Date.now }
    }],
    sprints: [sprintSchema],
}, { timestamps: true });

// Defind project names are unique within a workspace
projectSchema.index({ workspace: 1, name: 1 }, { unique: true });

// Document middleware
projectSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        const tasks = await TaskModel.find({ project: this._id });
        for (const task of tasks) {
            await task.deleteOne();
        }
        next();
    } catch (err) {
        next(err);
    }
});

// Query middleware
projectSchema.pre('deleteMany', { document: false, query: true }, async function(next) {
    try {
        const filter = this.getFilter();
        const projects = await mongoose.models.Project.find(filter);
        for (const project of projects) {
            await project.deleteOne();
        }
        next();
    } catch (err) {
        next(err);
    }
});

const ProjectModel = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default ProjectModel;