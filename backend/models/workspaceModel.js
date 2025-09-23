import mongoose from "mongoose";
import ProjectModel from './projectModel.js';

const workspaceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ["admin", "member"], default: 'member' },
        joinedAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });
workspaceSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        const projects = await ProjectModel.find({ workspace: this._id });
        for (const project of projects) {
            await project.deleteOne(); // triggers Project hooks
        }
        next();
    } catch (err) {
        next(err);
    }
});

// Query middleware (deleteMany, findOneAndDelete)
workspaceSchema.pre('deleteMany', { document: false, query: true }, async function(next) {
    try {
        const filter = this.getFilter();
        const workspaces = await mongoose.models.Workspace.find(filter);
        for (const ws of workspaces) {
            await ws.deleteOne();
        }
        next();
    } catch (err) {
        next(err);
    }
});

const WorkspaceModel = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
export default WorkspaceModel;