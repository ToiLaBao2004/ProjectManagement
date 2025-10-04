import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, CheckCircle, Clock, Sigma, AlertTriangle, Briefcase, FileText, Users, X, Trash2, Filter } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import AddMemberModal from '../components/AddMemberModal';

const API_URL = "http://localhost:4000";

const ProjectPage = () => {
    const { workspaceId, projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isRoleConfirmModalOpen, setIsRoleConfirmModalOpen] = useState(false);
    const [roleConfirmData, setRoleConfirmData] = useState({ userId: '', newRole: '' });
    const [isRemoveConfirmModalOpen, setIsRemoveConfirmModalOpen] = useState(false);
    const [removeConfirmUserId, setRemoveConfirmUserId] = useState('');
    const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState('');
    const [errorModal, setErrorModal] = useState({ open: false, message: '', type: '' });
    const [taskFilter, setTaskFilter] = useState('all'); // State for task status filter

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

                const projectRes = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProject(projectRes.data.project);

                const tasksRes = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}/task`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(tasksRes.data.tasks || []);

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

    // Handle task created
    const handleTaskCreated = (newTask) => {
        setTasks(prev => [...prev, newTask]);
        setIsTaskModalOpen(false);
    };

    // Handle member added
    const handleMemberAdded = async (addedMemberIds) => {
        try {
            const token = localStorage.getItem('token');
            const projectRes = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProject(projectRes.data.project);
        } catch (err) {
            console.error('Error refreshing project:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                navigate('/login');
            }
        }
    };

    // Handle remove member initiation
    const handleRemoveMember = (userId) => {
        setRemoveConfirmUserId(userId);
        setIsRemoveConfirmModalOpen(true);
    };

    // Handle remove confirmation
    const handleRemoveConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/workspace/${workspaceId}/project/${projectId}/remove-member`,
                { userId: removeConfirmUserId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(prev => ({
                ...prev,
                members: prev.members.filter(m => m.user._id !== removeConfirmUserId)
            }));
            setIsRemoveConfirmModalOpen(false);
            setRemoveConfirmUserId('');
        } catch (err) {
            console.error('Failed to remove member:', err);
            setIsRemoveConfirmModalOpen(false);
            setRemoveConfirmUserId('');
            setErrorModal({
                open: true,
                message: err.response?.data?.message || 'Failed to remove member',
                type: 'error'
            });
            setTimeout(() => setErrorModal({ open: false, message: '', type: '' }), 3000);
        }
    };

    // Handle role change initiation
    const handleRoleChange = (userId, newRole) => {
        setRoleConfirmData({ userId, newRole });
        setIsRoleConfirmModalOpen(true);
    };

    // Handle role change confirmation
    const handleRoleChangeConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/workspace/${workspaceId}/project/${projectId}/edit-member-role`,
                { userId: roleConfirmData.userId, role: roleConfirmData.newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(prev => ({
                ...prev,
                members: prev.members.map(m =>
                    m.user._id === roleConfirmData.userId ? { ...m, role: roleConfirmData.newRole } : m
                )
            }));
            setIsRoleConfirmModalOpen(false);
            setRoleConfirmData({ userId: '', newRole: '' });
        } catch (err) {
            console.error('Failed to update member role:', err);
            setIsRoleConfirmModalOpen(false);
            setRoleConfirmData({ userId: '', newRole: '' });
            setErrorModal({
                open: true,
                message: err.response?.data?.message || 'Failed to update role',
                type: 'error'
            });
            setTimeout(() => setErrorModal({ open: false, message: '', type: '' }), 3000);
        }
    };

    // Handle delete task initiation
    const handleDeleteTask = (taskId) => {
        setDeleteTaskId(taskId);
        setIsDeleteTaskModalOpen(true);
    };

    // Handle delete task confirmation
    const handleDeleteTaskConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/task/delete`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { taskId: deleteTaskId }
            });
            setTasks(prev => prev.filter(task => task._id !== deleteTaskId));
            setIsDeleteTaskModalOpen(false);
            setDeleteTaskId('');
            setErrorModal({
                open: true,
                message: 'Task deleted successfully',
                type: 'success'
            });
            setTimeout(() => setErrorModal({ open: false, message: '', type: '' }), 2000);
        } catch (err) {
            console.error('Failed to delete task:', err);
            setIsDeleteTaskModalOpen(false);
            setDeleteTaskId('');
            setErrorModal({
                open: true,
                message: err.response?.data?.message || 'Failed to delete task',
                type: 'error'
            });
            setTimeout(() => setErrorModal({ open: false, message: '', type: '' }), 3000);
        }
    };

    // Task statistics calculations
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inprogressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const overdueTasks = tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed').length;

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
        <div className="space-y-6 max-w-4xl mx-auto p-6">
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
                        onClick={() => setIsTaskModalOpen(true)}
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
                        <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-600">{inprogressTasks}</p>
                        <p className="text-gray-600">In Progress</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <Sigma className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
                        <p className="text-gray-600">Total Tasks</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-600">{highPriorityTasks}</p>
                        <p className="text-gray-600">High Priority</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-yellow-600">{mediumPriorityTasks}</p>
                        <p className="text-gray-600">Medium Priority</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <AlertTriangle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">{lowPriorityTasks}</p>
                        <p className="text-gray-600">Low Priority</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <Clock className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
                        <p className="text-gray-600">Overdue</p>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Tasks</h3>
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
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => navigate(`/task/${task._id}`)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-gray-900">{task.title}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed'
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
                                            <span>To: {task.assignee?.name || 'Unknown'}</span>
                                            <span>Sprint: {task.sprint?.name || 'No sprint'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTask(task._id);
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete Task"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
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
                            <div
                                key={sprint._id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                                onClick={() => navigate(`/task/sprint/${sprint._id}`)}
                            >
                                <h4 className="font-bold text-gray-900 mb-2">{sprint.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>
                                    <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>
                                    <span>
                                        Duration:{" "}
                                        {Math.ceil(
                                            (new Date(sprint.endDate) - new Date(sprint.startDate)) /
                                            (1000 * 60 * 60 * 24)
                                        )}{" "}
                                        days
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Members List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Members</h3>
                    <button
                        onClick={() => setIsAddMemberModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Member
                    </button>
                </div>
                {project?.members?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No members in this project. Add one to collaborate!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {project.members.map(member => (
                            <div key={member.user._id} className="flex items-center justify-between border-b border-gray-200 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                        {member.user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{member.user.name}</p>
                                        <p className="text-xs text-gray-500">{member.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="developer">Developer</option>
                                        <option value="tester">Tester</option>
                                    </select>
                                    <button
                                        onClick={() => handleRemoveMember(member.user._id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
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

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onMemberAdded={handleMemberAdded}
                workspaceId={workspaceId}
                projectId={projectId}
                currentMembers={project?.members || []}
            />

            {/* Role Confirmation Modal */}
            {isRoleConfirmModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsRoleConfirmModalOpen(false)} />
                    <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Role Change</h3>
                            <button
                                onClick={() => setIsRoleConfirmModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                            Are you sure you want to change this member’s role to{' '}
                            <span className="font-medium">{roleConfirmData.newRole}</span>?
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsRoleConfirmModalOpen(false)}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRoleChangeConfirm}
                                className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Confirmation Modal */}
            {isRemoveConfirmModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsRemoveConfirmModalOpen(false)} />
                    <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Removal</h3>
                            <button
                                onClick={() => setIsRemoveConfirmModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                            Are you sure you want to remove this member?
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsRemoveConfirmModalOpen(false)}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRemoveConfirm}
                                className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Task Confirmation Modal */}
            {isDeleteTaskModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsDeleteTaskModalOpen(false)} />
                    <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Task Deletion</h3>
                            <button
                                onClick={() => setIsDeleteTaskModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsDeleteTaskModalOpen(false)}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteTaskConfirm}
                                className="flex-1 py-3 px-4 bg-red-600 text-white font-medium rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error/Success Modal */}
            {errorModal.open && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setErrorModal({ open: false, message: '', type: '' })} />
                    <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{errorModal.type === 'success' ? 'Success' : 'Error'}</h3>
                            <button
                                onClick={() => setErrorModal({ open: false, message: '', type: '' })}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className={`p-3 mb-4 rounded text-sm ${errorModal.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {errorModal.message}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setErrorModal({ open: false, message: '', type: '' })}
                                className="py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectPage;