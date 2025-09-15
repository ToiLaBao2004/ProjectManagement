import mongoose from "mongoose";
import sprintSchema from "./sprintModel.js";

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

// Kiểm tra nếu model đã tồn tại để tránh lỗi OverwriteModelError
const ProjectModel = mongoose.model.Project || mongoose.model('Project', projectSchema);

export default ProjectModel;