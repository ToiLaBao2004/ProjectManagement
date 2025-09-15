import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    field: String,                // Trường nào thay đổi (status, priority, title, ...)
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
}, { _id: false });

export default historySchema;