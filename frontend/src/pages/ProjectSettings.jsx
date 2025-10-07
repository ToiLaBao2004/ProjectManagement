import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, Users, Calendar, AlertCircle, CheckCircle, Trash2, Plus, X } from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal';

const ProjectSettings = () => {
    const { workspaceId, projectId } = useParams();
    const navigate = useNavigate();
    const API_URL = "http://localhost:4000";

    const [project, setProject] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [availableMembers, setAvailableMembers] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [sprintData, setSprintData] = useState({ name: '', startDate: '', endDate: '' });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isRoleConfirmModalOpen, setIsRoleConfirmModalOpen] = useState(false);
    const [roleConfirmData, setRoleConfirmData] = useState({ userId: '', newRole: '' });
    const [isRemoveConfirmModalOpen, setIsRemoveConfirmModalOpen] = useState(false);
    const [removeConfirmUserId, setRemoveConfirmUserId] = useState('');
    const [isUpdateProjectConfirmOpen, setIsUpdateProjectConfirmOpen] = useState(false);
    const [isAddSprintConfirmOpen, setIsAddSprintConfirmOpen] = useState(false);
    const [isRemoveSprintConfirmOpen, setIsRemoveSprintConfirmOpen] = useState(false);
    const [removeSprintName, setRemoveSprintName] = useState('');
    const [isDeleteProjectConfirmOpen, setIsDeleteProjectConfirmOpen] = useState(false);

    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const currentUserId = currentUser.id; // Use 'id' to match localStorage

    // Debug: Log currentUser and currentUserId
    useEffect(() => {
        console.log('Current User:', currentUser);
        console.log('Current User ID:', currentUserId);
    }, [currentUser, currentUserId]);

    // Check if user is manager or owner
    const isManagerOrOwner = project && currentUserId && (
        project.owner?._id?.toString() === currentUserId ||
        project.members?.some(member =>
            member.user?._id?.toString() === currentUserId && member.role === 'manager'
        )
    );

    // Debug: Log isManagerOrOwner status
    useEffect(() => {
        console.log('Is Manager or Owner:', isManagerOrOwner);
        console.log('Project Owner ID:', project?.owner?._id?.toString());
        console.log('Project Members:', project?.members);
    }, [project, isManagerOrOwner]);

    // Fetch project and workspace data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found in localStorage');
                    navigate('/login');
                    return;
                }

                const [projectRes, workspaceRes] = await Promise.all([
                    axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/workspace/${workspaceId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                console.log('Project Response:', projectRes.data);
                console.log('Workspace Response:', workspaceRes.data);

                setProject(projectRes.data.project);
                setWorkspace(workspaceRes.data.workspace);
                setFormData({
                    name: projectRes.data.project.name || '',
                    description: projectRes.data.project.description || ''
                });
            } catch (err) {
                console.error('Error fetching data:', err.response?.data || err.message);
                setErrors({ general: err.response?.data?.message || 'Failed to load data.' });
                if (err.response?.status === 401) {
                    console.error('Unauthorized: Clearing localStorage and redirecting to login');
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [workspaceId, projectId, navigate]);

    // Calculate available members
    useEffect(() => {
        if (workspace && project) {
            const avail = workspace.members.filter(wMember =>
                !project.members.some(pMember =>
                    pMember.user._id.toString() === wMember.user._id.toString()
                )
            );
            setAvailableMembers(avail);
            console.log('Available Members:', avail);
        }
    }, [workspace, project]);

    // Handle project details change
    const handleProjectChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Initiate project update confirmation
    const handleProjectSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        if (!formData.name) {
            return setErrors({ name: 'Project name is required.' });
        }

        setIsUpdateProjectConfirmOpen(true);
    };

    // Confirm and submit project update
    const handleUpdateProjectConfirm = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${API_URL}/workspace/${workspaceId}/project/${projectId}/update`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(res.data.project);
            setSuccessMessage('Project details updated successfully.');
            setTimeout(() => setSuccessMessage(''), 5000);
            window.location.reload();
        } catch (err) {
            console.error('Error updating project:', err.response?.data || err.message);
            setErrors({ general: err.response?.data?.message || 'Failed to update project.' });
        } finally {
            setIsUpdateProjectConfirmOpen(false);
            setLoading(false);
        }
    };

    // Handle member added
    const handleMemberAdded = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const projectRes = await axios.get(`${API_URL}/workspace/${workspaceId}/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProject(projectRes.data.project);
            setSuccessMessage('Member(s) added successfully.');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Error refreshing project:', err.response?.data || err.message);
            setErrors({ general: err.response?.data?.message || 'Failed to add member(s).' });
        } finally {
            setLoading(false);
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
            setLoading(true);
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
            setSuccessMessage('Member role updated successfully.');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Failed to update member role:', err.response?.data || err.message);
            setErrors({ general: err.response?.data?.message || 'Failed to update role.' });
        } finally {
            setIsRoleConfirmModalOpen(false);
            setRoleConfirmData({ userId: '', newRole: '' });
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
            setLoading(true);
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
            const removedMember = workspace.members.find(m => m.user._id.toString() === removeConfirmUserId.toString());
            if (removedMember) {
                setAvailableMembers(prev => [...prev, removedMember]);
            }
            setSuccessMessage('Member removed successfully.');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Failed to remove member:', err.response?.data || err.message);
            setErrors({ general: err.response?.data?.message || 'Failed to remove member.' });
        } finally {
            setIsRemoveConfirmModalOpen(false);
            setRemoveConfirmUserId('');
            setLoading(false);
        }
    };

    // Handle sprint data change
    const handleSprintChange = (e) => {
        setSprintData({ ...sprintData, [e.target.name]: e.target.value });
    };

    // Initiate add sprint confirmation
    const handleAddSprint = (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        if (!sprintData.name || !sprintData.startDate || !sprintData.endDate) {
            return setErrors({
                name: !sprintData.name ? 'Sprint name is required.' : '',
                startDate: !sprintData.startDate ? 'Start date is required.' : '',
                endDate: !sprintData.endDate ? 'End date is required.' : ''
            });
        }

        setIsAddSprintConfirmOpen(true);
    };

    // Confirm and add sprint
    const handleAddSprintConfirm = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/workspace/${workspaceId}/project/${projectId}/add-sprint`,
                { name: sprintData.name, startDate: sprintData.startDate, endDate: sprintData.endDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(res.data.project);
            setSprintData({ name: '', startDate: '', endDate: '' });
            setSuccessMessage('Sprint added successfully.');
            setTimeout(() => setSuccessMessage(''), 5000);
            window.location.reload();
        } catch (err) {
            console.error('Error adding sprint:', err.response?.data || err.message);
            setErrors({ general: err.response?.data?.message || 'Failed to add sprint.' });
        } finally {
            setIsAddSprintConfirmOpen(false);
            setLoading(false);
        }
    };

    // Initiate remove sprint confirmation
    const handleRemoveSprint = (sprintId) => {
        setRemoveSprintName(sprintId);
        setIsRemoveSprintConfirmOpen(true);
    };

    // Confirm and remove sprint
    const handleRemoveSprintConfirm = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${API_URL}/workspace/${workspaceId}/project/${projectId}/remove-sprint`,
                { sprintId: removeSprintName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(res.data.project);
            setSuccessMessage('Sprint removed successfully.');
            setTimeout(() => setSuccessMessage(''), 5000);
            window.location.reload();
        } catch (err) {
            console.error('Error removing sprint:', err.response?.data || err.message);
            setErrors({ general: err.response?.data?.message || 'Failed to remove sprint.' });
        } finally {
            setIsRemoveSprintConfirmOpen(false);
            setRemoveSprintName('');
            setLoading(false);
        }
    };

    // Initiate delete project confirmation
    const handleDeleteProject = () => {
        setIsDeleteProjectConfirmOpen(true);
    };

    // Confirm and delete project
    const handleDeleteProjectConfirm = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_URL}/workspace/${workspaceId}/project/${projectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMessage('Project deleted successfully.');
            setTimeout(() => {
                navigate(`/workspace/${workspaceId}`);
            }, 2000);
        } catch (err) {
            console.error('Error deleting project:', err.response?.data || err.message);
            setErrors({ general: err.response?.data?.message || 'Failed to delete project.' });
        } finally {
            setIsDeleteProjectConfirmOpen(false);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Project Settings: {project?.name || 'Loading...'}
                </h2>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500" />
                        <span className="ml-2 text-sm text-gray-500">Loading...</span>
                    </div>
                )}

                {/* Error Message */}
                {errors.general && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-sm text-green-600">{successMessage}</p>
                    </div>
                )}

                {!loading && project && workspace && (
                    <div className="space-y-8">
                        {/* Project Details Form */}
                        <form onSubmit={handleProjectSubmit} className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                                Project Details
                            </h3>
                            {!isManagerOrOwner && (
                                <p className="text-sm text-gray-600">
                                    Only project managers or owners can edit project details.
                                    {currentUserId ? ` (Current User ID: ${currentUserId})` : ' (No user ID found)'}
                                </p>
                            )}
                            <div>
                                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleProjectChange}
                                    disabled={!isManagerOrOwner || loading}
                                    className={`mt-1 w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    placeholder="Enter project name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleProjectChange}
                                    disabled={!isManagerOrOwner || loading}
                                    className={`mt-1 w-full px-4 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    placeholder="Enter project description"
                                    rows="4"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!isManagerOrOwner || loading}
                                className="w-full bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed"
                            >
                                Update Project
                            </button>
                        </form>



                        {/* Members Management */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-500" />
                                    Members
                                </h3>
                                <button
                                    onClick={() => setIsAddMemberModalOpen(true)}
                                    disabled={!isManagerOrOwner || loading}
                                    className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Member
                                </button>
                            </div>
                            {!isManagerOrOwner && (
                                <p className="text-sm text-gray-600">
                                    Only project managers or owners can manage members.
                                    {currentUserId ? ` (Current User ID: ${currentUserId})` : ' (No user ID found)'}
                                </p>
                            )}
                            {project.members.length === 0 ? (
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
                                                {member.user._id.toString() === project.owner._id.toString() ? (
                                                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded">Owner</span>
                                                ) : (
                                                    <>
                                                        <select
                                                            value={member.role}
                                                            onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                                                            disabled={!isManagerOrOwner || loading}
                                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                        >
                                                            <option value="manager">Manager</option>
                                                            <option value="developer">Developer</option>
                                                            <option value="tester">Tester</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleRemoveMember(member.user._id)}
                                                            disabled={!isManagerOrOwner || loading}
                                                            className="text-red-600 hover:text-red-800 disabled:text-red-300"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sprints Management */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-500" />
                                Sprints
                            </h3>
                            {!isManagerOrOwner && (
                                <p className="text-sm text-gray-600">
                                    Only project managers or owners can manage sprints.
                                    {currentUserId ? ` (Current User ID: ${currentUserId})` : ' (No user ID found)'}
                                </p>
                            )}
                            <form onSubmit={handleAddSprint} className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="sprintName" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            Sprint Name
                                        </label>
                                        <input
                                            type="text"
                                            id="sprintName"
                                            name="name"
                                            value={sprintData.name}
                                            onChange={handleSprintChange}
                                            disabled={!isManagerOrOwner || loading}
                                            className={`mt-1 w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                            placeholder="Enter sprint name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="startDate" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name="startDate"
                                            value={sprintData.startDate}
                                            onChange={handleSprintChange}
                                            disabled={!isManagerOrOwner || loading}
                                            className={`mt-1 w-full px-4 py-2 border ${errors.startDate ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                        />
                                        {errors.startDate && (
                                            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="endDate" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name="endDate"
                                            value={sprintData.endDate}
                                            onChange={handleSprintChange}
                                            disabled={!isManagerOrOwner || loading}
                                            className={`mt-1 w-full px-4 py-2 border ${errors.endDate ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                        />
                                        {errors.endDate && (
                                            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!isManagerOrOwner || loading}
                                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Sprint
                                </button>
                            </form>

                            <div className="space-y-2">
                                {project.sprints.map((sprint) => (
                                    <div key={sprint._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{sprint.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'N/A'} -
                                                {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveSprint(sprint._id)}
                                            disabled={!isManagerOrOwner || loading}
                                            className="text-red-500 hover:text-red-600 disabled:text-red-300 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delete Project Section */}
                        {isManagerOrOwner && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                    Delete Project
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Permanently delete this project. This action cannot be undone.
                                </p>
                                <button
                                    onClick={handleDeleteProject}
                                    disabled={loading}
                                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Project
                                </button>
                            </div>
                        )}
                    </div>
                )}

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

                {/* Remove Member Confirmation Modal */}
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

                {/* Update Project Confirmation Modal */}
                {isUpdateProjectConfirmOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsUpdateProjectConfirmOpen(false)} />
                        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Confirm Project Update</h3>
                                <button
                                    onClick={() => setIsUpdateProjectConfirmOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">
                                Are you sure you want to update the project name and description?
                            </p>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateProjectConfirmOpen(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpdateProjectConfirm}
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Sprint Confirmation Modal */}
                {isAddSprintConfirmOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsAddSprintConfirmOpen(false)} />
                        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Confirm Add Sprint</h3>
                                <button
                                    onClick={() => setIsAddSprintConfirmOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">
                                Are you sure you want to add this sprint?
                            </p>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddSprintConfirmOpen(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddSprintConfirm}
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Remove Sprint Confirmation Modal */}
                {isRemoveSprintConfirmOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsRemoveSprintConfirmOpen(false)} />
                        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Confirm Remove Sprint</h3>
                                <button
                                    onClick={() => setIsRemoveSprintConfirmOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">
                                Are you sure you want to remove this sprint?
                            </p>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsRemoveSprintConfirmOpen(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveSprintConfirm}
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Project Confirmation Modal */}
                {isDeleteProjectConfirmOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsDeleteProjectConfirmOpen(false)} />
                        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl max-w-md w-full p-6 pointer-events-auto border border-white/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Confirm Delete Project</h3>
                                <button
                                    onClick={() => setIsDeleteProjectConfirmOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">
                                Are you sure you want to delete this project? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteProjectConfirmOpen(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteProjectConfirm}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white font-medium rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
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

export default ProjectSettings;