import React, { useState } from 'react';
import { X, Plus, Building2 } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://localhost:4000";

const WorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${API_URL}/workspace/create`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage({ 
                text: 'Workspace has been created successfully!', 
                type: 'success' 
            });

            setTimeout(() => {
                setFormData({ name: '', description: '' });
                onClose();
                onWorkspaceCreated(data.workspace);
            }, 1500);

        } catch (error) {
            console.error('Error creating workspace:', error);
            setMessage({
                text: error.response?.data?.message || 'An error occurred. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
                onClick={onClose} 
            />
            
            {/* Modal container */}
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto border border-white/30">
                
                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 rounded-t-3xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Create New Workspace</h3>
                                <p className="text-sm text-gray-600">Set up a new workspace for your team</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200/50 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mx-6 mt-4 p-3 rounded-xl text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Workspace Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Workspace Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Plus className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter workspace name..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (optional)
                        </label>
                        <div className="relative">
                            <textarea
                                rows={3}
                                placeholder="Enter a description for your workspace..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm resize-none"
                                disabled={loading}
                            />
                        </div>
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
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={loading || !formData.name.trim()}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create Workspace
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkspaceModal;
