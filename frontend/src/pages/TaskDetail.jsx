import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Save, Edit2, ArrowLeft, Send, MessageCircle } from 'lucide-react';

const API_URL = "http://localhost:4000";

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('comments'); // 'comments' or 'history'

    // Fetch task detail
    const fetchTask = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const res = await axios.get(`${API_URL}/task/task/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const taskData = res.data.task;
            setTask(taskData);
            setEditForm({
                title: taskData.title,
                description: taskData.description || '',
                priority: taskData.priority || 'medium',
                status: taskData.status || 'pending',
                dueDate: taskData.dueDate
                    ? new Date(taskData.dueDate).toISOString().split('T')[0]
                    : '',
                sprint: taskData.sprint?._id || ''
            });
        } catch (err) {
            console.error('Error fetching task:', err);
            setError(err.response?.data?.message || 'Failed to load task.');
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTask();
    }, [taskId, navigate]);

    // Edit form change
    const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

    // Save edit
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/task/${taskId}/update`, editForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsEditModalOpen(false);
            setMessage({ text: 'Task updated successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 2000);

            // Refetch task to get full history & user data
            fetchTask();
        } catch (err) {
            console.error('Error updating task:', err);
            setMessage({ text: err.response?.data?.message || 'Failed to update task.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Add comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/task/${taskId}/comment`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment('');
            setIsCommentModalOpen(true);
            setTimeout(() => setIsCommentModalOpen(false), 2000);

            // Refetch task to get full comment.user info
            fetchTask();
        } catch (err) {
            console.error('Error adding comment:', err);
            setMessage({ text: err.response?.data?.message || 'Failed to add comment.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
    if (!task) return <div className="text-center py-12 text-gray-600">Task not found.</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Task Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-green-600 hover:to-blue-700 transition-all"
                    >
                        <Edit2 className="w-5 h-5" /> Edit
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                </div>
            </div>

            {/* Task Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <p className="text-gray-600">{task.description || 'No description'}</p>
                <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                    <span>Priority: {task.priority || 'Medium'}</span>
                    <span>Status: {task.status || 'Unknown'}</span>
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                    <span>Assigned by: {task.owner?.name || 'Unknown'}</span>
                    <span>Project: {task.project?.name || 'Unknown Project'}</span>
                    <span>Sprint: {task.sprint?.name || 'Unknown'}</span>
                </div>
            </div>

            {/* Toggle Comments / History */}
            <div className="flex gap-2">
                <button
                    className={`px-4 py-2 rounded-md ${viewMode === 'comments' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setViewMode('comments')}
                >
                    Comments
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${viewMode === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setViewMode('history')}
                >
                    History
                </button>
            </div>

            {/* Comments */}
            {viewMode === 'comments' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Comments</h3>
                    <form onSubmit={handleAddComment} className="mb-4 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
                            disabled={!newComment.trim()}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    {task.comments.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No comments yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {task.comments
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((c) => (
                                    <div key={c._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center font-bold">
                                            {c.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{c.user?.name || 'Unknown'}</p>
                                            <p className="text-gray-700">{c.content}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            ) : (
                // History
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">History</h3>
                    {task.history.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No history yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {task.history
                                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                .map((h, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-medium">{h.updatedBy?.name || 'Unknown'}:</span> {h.field} changed
                                        </p>
                                        <p className="text-gray-700 text-sm">
                                            {h.oldValue !== null ? `From: ${h.oldValue}` : ''}
                                            {h.oldValue !== null && h.newValue !== null ? ' → ' : ''}
                                            {h.newValue !== null ? `To: ${h.newValue}` : ''}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{h.updatedAt ? new Date(h.updatedAt).toLocaleString() : 'Unknown date'}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 border border-white/30 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Edit Task</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editForm.title}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <select
                                        name="priority"
                                        value={editForm.priority}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={editForm.dueDate}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sprint</label>
                                <select
                                    name="sprint"
                                    value={editForm.sprint}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">No sprint</option>
                                    {task.project?.sprints?.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-2 px-4 border rounded-lg text-gray-700 hover:bg-gray-100">Cancel</button>
                                <button type="submit"
                                    className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-blue-700">
                                    <Save className="w-5 h-5" /> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Comment Success Modal */}
            {isCommentModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCommentModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 border border-white/30">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">Success</h3>
                            <button onClick={() => setIsCommentModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-700">Your comment has been added!</p>
                    </div>
                </div>
            )}

            {/* Message */}
            {message.text && (
                <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default TaskDetail;
