import mongoose from "mongoose";
import commentSchema from "./commentModel.js";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    dueDate: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    comments: [commentSchema],
}, { timestamps: true });

const taskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default taskModel;