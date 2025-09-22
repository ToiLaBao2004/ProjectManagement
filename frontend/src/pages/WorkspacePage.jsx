import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Briefcase, Loader2 } from 'lucide-react';
import ProjectModal from "../components/ProjectModal";

const API_URL = "http://localhost:4000";

const WorkspacePage = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    // Debug: Log workspaceId để kiểm tra
    console.log('WorkspacePage - workspaceId:', workspaceId);

    // Fetch workspace details and projects
    useEffect(() => {
        // Kiểm tra nếu không có workspaceId
        if (!workspaceId) {
            console.error('No workspaceId in params');
            navigate('/'); // Redirect về home nếu không có workspaceId
            return;
        }

        const fetchWorkspaceAndProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token found, redirecting to login');
                    navigate('/login');
                    return;
                }

                console.log('Fetching workspace:', workspaceId);

                // Fetch workspace
                const workspaceRes = await axios.get(`${API_URL}/workspace/${workspaceId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Workspace response:', workspaceRes.data);
                setWorkspace(workspaceRes.data.workspace);

                // Fetch projects
                const projectsRes = await axios.get(`${API_URL}/workspace/${workspaceId}/project`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Projects response:', projectsRes.data);
                setProjects(projectsRes.data.projects || []);
            } catch (err) {
                console.error('Error fetching workspace/projects:', err);
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

        fetchWorkspaceAndProjects();
    }, [workspaceId, navigate]);

    const handleProjectCreated = (newProject) => {
        console.log('Project created:', newProject);
        setProjects(prev => [...prev, newProject]);
        setIsProjectModalOpen(false);
        if (newProject._id) {
            navigate(`/workspace/${workspaceId}/project/${newProject._id}`);
        }
    };

    // Kiểm tra nếu đang loading hoặc error
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-gray-500">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">{error}</div>
                <button 
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go Back to Home
                </button>
            </div>
        );
    }

    // Kiểm tra nếu workspace không tồn tại
    if (!workspace) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 mb-4">Workspace not found</div>
                <button 
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Workspace: {workspace.name}
                        </h2>
                        <p className="text-gray-600 mt-1">{workspace.description || 'No description'}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        <span>ID: {workspace._id}</span>
                        <br />
                        <span>Members: {workspace.members?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Projects ({projects.length})</h3>
                    <button 
                        onClick={() => setIsProjectModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h4 className="text-lg font-medium mb-2">No projects yet</h4>
                        <p className="mb-4">Create your first project to get started!</p>
                        <button 
                            onClick={() => setIsProjectModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create First Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <div 
                                key={project._id}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => {
                                    console.log('Navigating to project:', project._id);
                                    navigate(`/workspace/${workspaceId}/project/${project._id}`);
                                }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                        {project.name}
                                    </h4>
                                    <div className={`px-2 py-1 text-xs rounded-full ${
                                        project.members?.length > 5 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {project.members?.length || 0} members
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {project.description || 'No description'}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Owner: {project.owner?.name || 'Unknown'}</span>
                                    <span className="text-blue-600 font-medium">
                                        {project.sprints?.length || 0} sprints
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Project Modal */}
            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onProjectCreated={handleProjectCreated}
                workspaceId={workspaceId}
                workspaceName={workspace?.name}
            />
        </div>
    );
};

export default WorkspacePage;