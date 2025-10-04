import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect(process.env.CONNECTION_STRING)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.log(err));}