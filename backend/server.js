import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js';
import workspaceRouter from './routes/workspaceRoute.js';
import taskRouter from './routes/taskRoute.js';
import passport from 'passport';
import authRouter from './routes/authRoute.js';
import notificationRouter from './routes/notificationRoute.js';
import "./services/notificationService.js";

// Khởi tạo ứng dụng Express
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối đến cơ sở dữ liệu
connectDB();

// Routes
app.use(passport.initialize());
app.use('/user', userRouter);
app.use('/workspace', workspaceRouter);
app.use("/auth", authRouter);

app.use('/task', taskRouter);
app.use('/notification', notificationRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});