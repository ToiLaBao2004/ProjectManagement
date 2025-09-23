import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Save, Trash2, Building2 } from 'lucide-react';

const API_URL = "http://localhost:4000";

const WorkspaceSettings = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Fetch workspace details
    useEffect(() => {
        const fetchWorkspace = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await axios.get(`${API_URL}/workspace/${workspaceId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { name, description } = res.data.workspace;
                setFormData({ name, description });
            } catch (err) {
                console.error('Error fetching workspace:', err);
                setError(err.response?.data?.message || 'Failed to load workspace.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspace();
    }, [workspaceId, navigate]);

    // Handle form submission for updating workspace
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/workspace/${workspaceId}/update`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ text: 'Workspace updated successfully!', type: 'success' });
            setTimeout(() => navigate(`/workspace/${workspaceId}`), 1500);
        } catch (err) {
            console.error('Error updating workspace:', err);
            setMessage({
                text: err.response?.data?.message || 'Failed to update workspace.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle workspace deletion
    const handleDelete = async () => {
        console.log('Delete button clicked'); // Debug log
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setShowDeleteConfirm(false);
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/workspace/${workspaceId}/delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ text: 'Workspace deleted successfully!', type: 'success' });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error('Error deleting workspace:', err);
            setMessage({
                text: err.response?.data?.message || 'Failed to delete workspace.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    if (loading && !formData.name) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-12 text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    Workspace Settings
                </h2>

                {message.text && (
                    <div
                        className={`p-3 mb-4 rounded text-sm ${
                            message.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Workspace Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={loading || !formData.name.trim()}
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Workspace
                        </button>
                    </div>
                </form>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancelDelete} />
                        <div className="relative bg-white rounded-lg p-6 w-full max-w-md pointer-events-auto shadow-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
                            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this workspace? This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancelDelete}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    disabled={loading}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceSettings;