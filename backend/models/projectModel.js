import mongoose from "mongoose";
import sprintSchema from "./sprintModel";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true, uppercase: true},
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ["manager", "developer", "tester"], default: 'developer' },
        joinedAt: { type: Date, default: Date.now }
    }],
    sprint: [sprintSchema],
    createdAt: { type: Date, default: Date.now },
});

// Kiểm tra nếu model đã tồn tại để tránh lỗi OverwriteModelError
const ProjectModel = mongoose.model.Project || mongoose.model('Project', projectSchema);

export default ProjectModel;