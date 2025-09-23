import React, { useState, useEffect } from 'react';
import { X, Plus, FileText, Users, ChevronDown } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = "http://localhost:4000";

const AddMemberModal = ({ isOpen, onClose, onMemberAdded, workspaceId, projectId, currentMembers }) => {
    const [workspaceMembers, setWorkspaceMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;
        const fetchWorkspaceMembers = async () => {
            setLoading(true);
            setMessage({ text: '', type: '' });
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await axios.get(`${API_URL}/workspace/${workspaceId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const availableMembers = res.data.workspace.members.filter(
                    wm => !currentMembers.some(cm => cm.user._id === wm.user._id)
                );
                setWorkspaceMembers(availableMembers);
            } catch (err) {
                console.error('Error fetching workspace members:', err);
                setMessage({
                    text: err.response?.data?.message || 'Failed to load workspace members.',
                    type: 'error'
                });
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspaceMembers();
    }, [isOpen, workspaceId, currentMembers, navigate]);

    const handleSelectMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleAddMembers = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            for (const memberId of selectedMembers) {
                await axios.put(
                    `${API_URL}/workspace/${workspaceId}/project/${projectId}/add-member`,
                    { userId: memberId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setMessage({ text: 'Members added successfully!', type: 'success' });
            onMemberAdded(selectedMembers);
            setSelectedMembers([]);
            setTimeout(onClose, 1500);
        } catch (err) {
            console.error('Error adding members:', err.response?.data || err);
            setMessage({
                text: err.response?.data?.message || 'Failed to add members.',
                type: 'error'
            });
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Add Members to Project</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {message.text && (
                    <div
                        className={`p-3 mb-4 rounded text-sm ${message.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {message.text}
                    </div>
                )}
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : workspaceMembers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No available members to add.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {workspaceMembers.map(member => (
                            <div
                                key={member.user._id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                onClick={() => handleSelectMember(member.user._id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(member.user._id)}
                                    onChange={() => handleSelectMember(member.user._id)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                    {member.user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{member.user.name}</p>
                                    <p className="text-xs text-gray-500">{member.user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {workspaceMembers.length > 0 && (
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddMembers}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={loading || selectedMembers.length === 0}
                        >
                            <Plus className="w-4 h-4" />
                            Add Selected
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddMemberModal;