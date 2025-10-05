import cron from 'node-cron';
import NotificationModel from "../models/notificationModel.js";
import Task from "../models/taskModel.js";

export async function createNotification({ user, type, title, message, task }) {
    try {
        const notify = new NotificationModel({
            user,
            type,
            title,
            message,
            task
        });
        await notify.save();
        return notify;
    } catch (err) {
        console.error("Error creating notification:", err);
    }
}

// Cron job: check task sắp đến hạn
cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();
        const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const tasks = await Task.find({
            status: { $ne: "completed" },
            dueDate: { $gte: now, $lte: oneDayLater }
        });
        for (const task of tasks) {
            // tránh gửi trùng lặp (nếu đã tạo thông báo trước đó)
            const exists = await NotificationModel.findOne({
                user: task.owner,
                type: "task_due_soon",
                task: task._id
            });
            if (!exists) {
                await createNotification({
                    user: task.owner,
                    type: "task_due_soon",
                    title: "Task sắp đến hạn",
                    message: `Task "${task.title}" sẽ đến hạn vào ${task.dueDate.toLocaleString()}`,
                    task: task._id
                });
            }
            if (task.assignee.toString() !== task.owner.toString()) {
                const assigneeExists = await NotificationModel.findOne({
                    user: task.assignee,
                    type: "task_due_soon",
                    task: task._id
                });
                if (!assigneeExists) {
                    await createNotification({
                        user: task.assignee,
                        type: "task_due_soon",
                        title: "Task bạn được giao sắp đến hạn",
                        message: `Task "${task.title}" sẽ đến hạn vào ${task.dueDate.toLocaleString()}`,
                        task: task._id
                    });
                }
            }
        }
        console.log(`[CRON] Checked tasks due soon at ${now.toISOString()}`);
    } catch (err) {
        console.error("Error in task_due_soon cron:", err);
    }
});