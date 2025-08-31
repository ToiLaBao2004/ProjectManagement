import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://ngyyennhoaiiibaoo:baoproviplun2015%40@ngyyennhoaiiibaoo.o6hnwf3.mongodb.net/ProjectFlow")
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.log(err));}