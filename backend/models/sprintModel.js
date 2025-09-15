import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema({
    name:  { type: String, unique: true, required: true },
    start: { type: Date },
    end:   { type: Date }
}, { _id: false });

export default sprintSchema;