import mongoose from "mongoose";

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

const WorkspaceModel = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);

export default WorkspaceModel;