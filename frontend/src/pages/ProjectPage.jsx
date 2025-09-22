import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, CheckCircle, Clock, AlertTriangle, Briefcase, FileText } from 'lucide-react';
import TaskModal from '../components/TaskModal';

const API_URL = "http://localhost:4000";

const ProjectPage = () => {
    const { workspaceId, projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // Uncomment

    // Fetch project, tasks, sprints
    useEffect(() => {
        const fetchProjectData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Fetch project
                const projectRes = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProject(projectRes.data.project);

                // Fetch tasks
                const tasksRes = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}/task`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(tasksRes.data.tasks || []);

                // Fetch sprints
                const sprintsRes = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}/sprints`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSprints(sprintsRes.data.sprints || []);
            } catch (err) {
                console.error('Error fetching project data:', err);
                setError(err.response?.data?.message || 'Failed to load project.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [workspaceId, projectId, navigate]);

    // Stats for tasks
    const pendingTasks = tasks.filter(task => task.status !== 'completed').length;
    const completedTasks = tasks.length - pendingTasks;
    const totalTasks = tasks.length;

    // Handle task created
    const handleTaskCreated = (newTask) => {
        setTasks(prev => [...prev, newTask]);
        setIsTaskModalOpen(false);
    };

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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Project: {project?.name || 'Loading...'}
                </h2>
                <p className="text-gray-600 mb-4">{project?.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Owner: {project?.owner?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>Members: {project?.members?.length || 0}</span>
                    <span>•</span>
                    <span>Sprints: {sprints.length}</span>
                </div>
            </div>

            {/* Task Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Task Statistics</h3>
                    <button 
                        onClick={() => setIsTaskModalOpen(true)} // Uncomment
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Task
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                        <p className="text-gray-600">Completed</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-600">{pendingTasks}</p>
                        <p className="text-gray-600">Pending</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <AlertTriangle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
                        <p className="text-gray-600">Total Tasks</p>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tasks</h3>
                {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No tasks in this project. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-gray-900">{task.title}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                task.status === 'completed' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{task.description || 'No description'}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>Priority: {task.priority || 'Medium'}</span>
                                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                                            <span>Assigned by: {task.owner?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sprints List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sprints</h3>
                {sprints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No sprints in this project. Add one to organize your work!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sprints.map(sprint => (
                            <div key={sprint.name} className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold text-gray-900 mb-2">{sprint.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>
                                    <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>
                                    <span>Duration: {Math.ceil((new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24))} days</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onTaskCreated={handleTaskCreated}
                projectId={projectId}
                workspaceId={workspaceId}
                projectName={project?.name}
            />
        </div>
    );
};

export default ProjectPage;