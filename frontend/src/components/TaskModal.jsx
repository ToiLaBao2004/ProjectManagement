import React, { useState, useEffect } from 'react';
import { X, Plus, FileText, Users, ChevronDown } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://localhost:4000";

const TaskModal = ({ isOpen, onClose, onTaskCreated, projectId, workspaceId, projectName }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        assigner: '',
        sprintId: ''
    });
    const [projectMembers, setProjectMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showMembersDropdown, setShowMembersDropdown] = useState(false);
    const [sprints, setSprints] = useState([]);
    const [loadingSprints, setLoadingSprints] = useState(false);

    useEffect(() => {
        if (isOpen && projectId) {
            fetchProjectMembers();
            fetchProjectSprints();
        }
    }, [isOpen, projectId]);

    const fetchProjectMembers = async () => {
        setLoadingMembers(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const members = data.project?.members || [];
            setProjectMembers(members);

            const currentUserId = localStorage.getItem('currentUser')
                ? JSON.parse(localStorage.getItem('currentUser')).id
                : null;
            if (currentUserId && !formData.assigner) {
                setFormData(prev => ({ ...prev, assigner: currentUserId }));
            }
        } catch (error) {
            console.error('Error fetching project members:', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchProjectSprints = async () => {
        setLoadingSprints(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const today = new Date();
            const projectSprints = data.project?.sprints || [];
            const activeSprints = projectSprints.filter(sprint => {
                const start = new Date(sprint.startDate);
                const end = new Date(sprint.endDate);
                return start <= today && today <= end;
            });

            setSprints(activeSprints);
        } catch (error) {
            console.error("Error fetching sprints:", error);
        } finally {
            setLoadingSprints(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const { data, status } = await axios.post(
                `${API_URL}/workspace/${workspaceId}/project/${projectId}/task/create`,
                {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    priority: formData.priority,
                    status: formData.status,
                    dueDate: formData.dueDate,
                    assigner: formData.assigner,
                    sprintId: formData.sprintId || null
                },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            // Debug the response
            console.log('API Response:', { data, status });

            // Check if the request was successful (status 200-299)
            if (status >= 200 && status < 300) {
                const task = data.newTask; // Match the backend's response key
                if (!task) {
                    throw new Error(data.message || 'Task created but no task data returned');
                }

                setMessage({ text: 'Task created successfully!', type: 'success' });

                setTimeout(() => {
                    setFormData({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '', assigner: '' });
                    setShowMembersDropdown(false);
                    onClose();
                    if (onTaskCreated && task) onTaskCreated(task);
                }, 1500);
            } else {
                throw new Error(data.message || `Unexpected status code: ${status}`);
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error occurred while creating task.';
            setMessage({ text: errorMessage, type: 'error' });
            console.error('Task creation error:', error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ text: '', type: '' });
    };

    const handleMemberSelect = (memberId) => {
        setFormData(prev => ({ ...prev, assigner: memberId }));
        setShowMembersDropdown(false);
    };

    const currentUserId = localStorage.getItem('currentUser')
        ? JSON.parse(localStorage.getItem('currentUser')).id
        : null;

    const selectedMember = projectMembers.find(member => member.user._id === formData.assigner);
    const displayAssigner = selectedMember
        ? selectedMember.user.name || selectedMember.user.email
        : 'Select a member';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto border border-white/30">

                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 rounded-t-3xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
                                <p className="text-sm text-gray-600">Add a task to <span className="font-medium">{projectName}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
                            disabled={loading}
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mx-6 mt-4 p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pt-1">
                                <Plus className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="title"
                                placeholder="Enter task title..."
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                required
                                disabled={loading}
                                maxLength={100}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Enter detailed description..."
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={loading}
                            maxLength={500}
                        />
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (optional)</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={loading}
                        />
                    </div>

                    {/* Assigner */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign To <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <div className="flex items-center border border-gray-300 rounded-2xl focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all bg-white/70 backdrop-blur-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pt-1">
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Select a member..."
                                    value={displayAssigner}
                                    onFocus={() => !loadingMembers && setShowMembersDropdown(true)}
                                    className="w-full pl-10 pr-10 py-3 bg-transparent border-none focus:outline-none"
                                    disabled={loading || loadingMembers}
                                    readOnly
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto"
                                    disabled={loading || loadingMembers}
                                >
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMembersDropdown ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {showMembersDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-md border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                                    {loadingMembers ? (
                                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 mx-auto mb-1"></div>
                                            Loading members...
                                        </div>
                                    ) : projectMembers.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                            No members found
                                        </div>
                                    ) : (
                                        projectMembers.map(member => {
                                            const memberUser = member.user;
                                            const isSelected = memberUser._id === formData.assigner;
                                            const isCurrentUser = memberUser._id === currentUserId;
                                            return (
                                                <button
                                                    key={memberUser._id}
                                                    type="button"
                                                    onClick={() => handleMemberSelect(memberUser._id)}
                                                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${isSelected ? 'bg-green-50 text-green-700 border-l-2 border-green-500' : ''}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                                                            {memberUser.name?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-medium truncate text-sm">{memberUser.name || memberUser.email}</div>
                                                            <div className="text-xs text-gray-500 truncate">{memberUser.email}</div>
                                                        </div>
                                                    </div>
                                                    {isCurrentUser && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Select a member to assign the task (default is you)</p>
                    </div>

                    {/* Sprint Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sprint (optional)</label>
                        <select
                            name="sprintId"
                            value={formData.sprintId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={loading || loadingSprints}
                        >
                            <option value="">-- No Sprint --</option>
                            {sprints.map(sprint => (
                                <option key={sprint._id} value={sprint._id}>
                                    {sprint.name} ({new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                        {loadingSprints && <p className="text-xs text-gray-500 mt-1">Loading sprints...</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={loading || !formData.title.trim() || !formData.assigner}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;