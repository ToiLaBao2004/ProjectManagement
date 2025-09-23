import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Mail, Plus, X } from 'lucide-react';

const API_URL = 'http://localhost:4000';

const WorkspaceMembers = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState({ text: '', type: '' });
    const [isRoleConfirmModalOpen, setIsRoleConfirmModalOpen] = useState(false);
    const [roleConfirmData, setRoleConfirmData] = useState({ userId: '', newRole: '' });
    const [isRemoveConfirmModalOpen, setIsRemoveConfirmModalOpen] = useState(false);
    const [removeConfirmUserId, setRemoveConfirmUserId] = useState('');
    const [errorModal, setErrorModal] = useState({ open: false, message: '' });

    // Fetch workspace and members
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
                setWorkspace(res.data.workspace);
            } catch (err) {
                console.error('Error fetching workspace:', err);
                setError(err.response?.data?.message || 'Failed to load members.');
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

    // Handle invite submission
    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setInviteMessage({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/workspace/${workspaceId}/invite`,
                { email: inviteEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInviteMessage({ text: 'Invitation sent successfully!', type: 'success' });
            setInviteEmail('');
            setTimeout(() => setIsInviteModalOpen(false), 1500);
        } catch (err) {
            console.error('Error sending invitation:', err);
            setInviteMessage({
                text: err.response?.data?.message || 'Failed to send invitation.',
                type: 'error'
            });
        } finally {
            setLoading(false);
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
                `${API_URL}/workspace/${workspaceId}/remove-member`,
                { userId: removeConfirmUserId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWorkspace({
                ...workspace,
                members: workspace.members.filter(m => m.user._id !== removeConfirmUserId)
            });
            setIsRemoveConfirmModalOpen(false);
            setRemoveConfirmUserId('');
        } catch (err) {
            console.error('Failed to remove member:', err);
            setIsRemoveConfirmModalOpen(false);
            setRemoveConfirmUserId('');
            setErrorModal({
                open: true,
                message: err.response?.data?.message || 'Failed to remove member'
            });
            setTimeout(() => setErrorModal({ open: false, message: '' }), 3000);
        }
    };

    // Handle role change confirmation
    const handleRoleChangeConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/workspace/${workspaceId}/update-member-role`,
                { userId: roleConfirmData.userId, role: roleConfirmData.newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWorkspace({
                ...workspace,
                members: workspace.members.map(m =>
                    m.user._id === roleConfirmData.userId ? { ...m, role: roleConfirmData.newRole } : m
                )
            });
            setIsRoleConfirmModalOpen(false);
            setRoleConfirmData({ userId: '', newRole: '' });
        } catch (err) {
            console.error('Failed to update member role:', err);
            setIsRoleConfirmModalOpen(false);
            setRoleConfirmData({ userId: '', newRole: '' });
            setErrorModal({
                open: true,
                message: err.response?.data?.message || 'Failed to update role'
            });
            setTimeout(() => setErrorModal({ open: false, message: '' }), 3000);
        }
    };

    // Handle role change initiation
    const handleRoleChange = (userId, newRole) => {
        setRoleConfirmData({ userId, newRole });
        setIsRoleConfirmModalOpen(true);
    };

    if (loading) {
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
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Workspace Members
                    </h2>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Invite Member
                    </button>
                </div>

                <div className="space-y-4">
                    {workspace.members.map(member => (
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
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
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
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)} />
                    <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Invite Member</h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {inviteMessage.text && (
                            <div
                                className={`p-3 mb-4 rounded text-sm ${
                                    inviteMessage.type === 'success'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {inviteMessage.text}
                            </div>
                        )}
                        <form onSubmit={handleInviteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="flex items-center border rounded px-3 py-2">
                                    <Mail className="text-blue-500 w-5 h-5 mr-2" />
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full focus:outline-none text-sm text-gray-700"
                                        placeholder="Enter email to invite"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={loading || !inviteEmail.trim()}
                                >
                                    <Plus className="w-4 h-4" />
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

            {/* Error Modal */}
            {errorModal.open && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setErrorModal({ open: false, message: '' })} />
                    <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Error</h3>
                            <button
                                onClick={() => setErrorModal({ open: false, message: '' })}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-3 mb-4 rounded text-sm bg-red-100 text-red-700">
                            {errorModal.message}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setErrorModal({ open: false, message: '' })}
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

export default WorkspaceMembers;