import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, AlertTriangle, Briefcase, FileText, Filter } from 'lucide-react';

const API_URL = "http://localhost:4000";

const MyTasksPage = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [taskFilter, setTaskFilter] = useState('all'); // State for task status filter

    // Fetch my tasks
    useEffect(() => {
        const fetchMyTasks = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await axios.get(`${API_URL}/task/task/assignee`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(res.data.tasks || []);
            } catch (err) {
                console.error('Error fetching my tasks:', err);
                setError(err.response?.data?.message || 'Failed to load tasks.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMyTasks();
    }, [navigate]);

    // Stats
    const pendingTasks = tasks.filter(task => task.status !== 'completed').length;
    const completedTasks = tasks.length - pendingTasks;
    const totalTasks = tasks.length;
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;

    // Filtered tasks based on status
    const filteredTasks = taskFilter === 'all'
        ? tasks
        : tasks.filter(task => task.status === taskFilter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    My Tasks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Total Tasks</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Completed</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">High Priority</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{highPriorityTasks}</p>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Task List</h3>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <select
                            value={taskFilter}
                            onChange={(e) => setTaskFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Tasks</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No tasks found for this filter.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map(task => (
                            <div
                                key={task._id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/task/${task._id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-gray-900">{task.title}</h4>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}
                                            >
                                                {task.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{task.description || 'No description'}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                            <span>Priority: {task.priority || 'Medium'}</span>
                                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Project:</span>
                                            <Link
                                                to={`/workspace/${task.project?.workspace}/project/${task.project?._id}`}
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                {task.project?.name || 'Unknown Project'}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTasksPage;