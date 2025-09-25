import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true }
});

export default sprintSchema;