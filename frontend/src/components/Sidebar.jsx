import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ChevronDown, 
    Briefcase, 
    CheckSquare, 
    Settings, 
    Users,
    User 
} from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ user, tasks }) => {
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [projects, setProjects] = useState([]);
    const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const navigate = useNavigate();

    const API_URL = "http://localhost:4000";

    // Fetch user's workspaces
    useEffect(() => {
        const fetchWorkspaces = async () => {
            setLoadingWorkspaces(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const { data } = await axios.get(`${API_URL}/workspace/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setWorkspaces(data.workspaces || []);
                if (data.workspaces.length > 0) {
                    setSelectedWorkspace(data.workspaces[0]);
                }
            } catch (err) {
                console.error('Error fetching workspaces:', err);
            } finally {
                setLoadingWorkspaces(false);
            }
        };

        if (user && user.id) {
            fetchWorkspaces();
        }
    }, [user]);

    // Fetch projects for selected workspace
    useEffect(() => {
        const fetchProjects = async () => {
            if (!selectedWorkspace) return;
            
            setLoadingProjects(true);
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/workspace/${selectedWorkspace._id}/project`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setProjects(data.projects || []);
            } catch (err) {
                console.error('Error fetching projects:', err);
            } finally {
                setLoadingProjects(false);
            }
        };

        fetchProjects();
    }, [selectedWorkspace]);

    const handleWorkspaceSelect = (workspace) => {
        setSelectedWorkspace(workspace);
        setWorkspaceDropdownOpen(false);
        // Optional: Navigate to workspace-specific route
        // navigate(`/workspace/${workspace._id}`);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (workspaceDropdownOpen && !event.target.closest('.sidebar-workspace-dropdown')) {
                setWorkspaceDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [workspaceDropdownOpen]);

    // Calculate task stats
    const totalTasks = tasks?.length || 0;
    const pendingTasks = tasks?.filter(task => task.status !== 'completed').length || 0;
    const completedTasks = totalTasks - pendingTasks;

    return (
        <div className="fixed left-0 top-16 bottom-0 w-16 md:w-64 bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 z-40
        flex flex-col shadow-lg">
            
            {/* User Greeting Section */}
            <div className="p-3 md:p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="hidden md:block flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-gray-800 truncate">
                        Hello, {user?.name || 'User'}
                    </h2>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user?.email || 'user@example.com'}
                    </p>
                </div>
                <div className="md:hidden flex justify-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center font-medium text-sm">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-2">
                
                {/* Workspace Dropdown */}
                <div className="relative sidebar-workspace-dropdown mb-2">
                    <button 
                        onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                        className="flex items-center justify-between w-full px-3 py-3 md:px-4 md:py-4 hover:bg-gray-50 transition-colors rounded-lg mx-1"
                        title={selectedWorkspace ? selectedWorkspace.name : 'Select Workspace'}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                                <Briefcase className="w-5 h-5 text-sky-500" />
                            </div>
                            <div className="hidden md:block min-w-0 flex-1">
                                <span className="text-sm font-medium text-gray-700 truncate block">
                                    {selectedWorkspace ? selectedWorkspace.name : 'Select Workspace'}
                                </span>
                                {selectedWorkspace && (
                                    <span className="text-xs text-gray-500 truncate block">
                                        {selectedWorkspace.description || 'No description'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 
                            ${workspaceDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Workspace Dropdown List */}
                    {workspaceDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-xl z-50 max-h-64 overflow-y-auto">
                            <div className="py-1">
                                {loadingWorkspaces ? (
                                    <div className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-500" />
                                            <span>Loading workspaces...</span>
                                        </div>
                                    </div>
                                ) : workspaces.length === 0 ? (
                                    <div className="px-4 py-4 text-center text-sm text-gray-500">
                                        <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-lg bg-gray-100">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <p className="font-medium">No workspaces</p>
                                        <p className="text-xs mt-1">Create your first workspace</p>
                                    </div>
                                ) : (
                                    workspaces.map((workspace) => (
                                        <button
                                            key={workspace._id}
                                            onClick={() => handleWorkspaceSelect(workspace)}
                                            className={`w-full px-4 py-3 text-left hover:bg-sky-50 transition-colors text-sm flex items-center gap-3
                                            ${selectedWorkspace?._id === workspace._id ? 'bg-sky-50 text-sky-700 font-medium border-sky-200' : 'text-gray-700 hover:border-sky-100 border-l-2 border-transparent'}`}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 
                                                opacity-0 ${selectedWorkspace?._id === workspace._id ? 'opacity-100' : ''}" />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium truncate">{workspace.name}</div>
                                                <div className="text-xs text-gray-500 truncate mt-0.5">
                                                    {workspace.description || 'No description'}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 flex-shrink-0">
                                                {workspace.members?.length || 0} members
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Projects Section */}
                <div className="space-y-1 mb-4">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:block">
                        Projects ({projects.length})
                    </div>
                    
                    {loadingProjects ? (
                        <div className="px-3 py-3">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500" />
                                <span className="hidden md:inline">Loading projects...</span>
                            </div>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="px-4 py-4 text-center md:text-left">
                            <div className="hidden md:block text-sm text-gray-500">
                                No projects in this workspace
                            </div>
                            <div className="md:hidden flex justify-center">
                                <Briefcase className="w-6 h-6 text-gray-400" />
                            </div>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <Link
                                key={project._id}
                                to={`/workspace/${selectedWorkspace?._id}/project/${project._id}`}
                                className="group flex items-center px-3 py-2 md:px-4 md:py-3 hover:bg-gray-50 transition-colors gap-3 rounded-lg mx-1 text-sm"
                                title={project.name}
                            >
                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-transparent 
                                    group-hover:bg-blue-500 transition-colors" />
                                <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0 hidden md:block" />
                                <div className="min-w-0 flex-1 hidden md:block">
                                    <span className="font-medium text-gray-700 truncate block">{project.name}</span>
                                    {project.description && (
                                        <span className="text-xs text-gray-500 truncate block">
                                            {project.description}
                                        </span>
                                    )}
                                </div>
                                <div className="hidden md:block text-xs text-gray-400 flex-shrink-0">
                                    {project.members?.length || 0} members
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Quick Actions */}
                <div className="border-t border-gray-100 pt-2 space-y-1">
                    
                    {/* My Tasks */}
                    <Link 
                        to="/my-tasks" 
                        className="group flex items-center px-3 py-2 md:px-4 md:py-3 hover:bg-blue-50 transition-colors gap-3 rounded-lg mx-1 text-sm"
                    >
                        <div className="relative flex-shrink-0">
                            <CheckSquare className="w-5 h-5 text-green-500" />
                            {pendingTasks > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                    {pendingTasks > 9 ? '9+' : pendingTasks}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="font-medium text-gray-700 hidden md:inline">My Tasks</span>
                            {pendingTasks > 0 && (
                                <div className="hidden md:block space-y-0.5 mt-1">
                                    <div className="text-xs text-green-600 font-medium">{completedTasks} completed</div>
                                    <div className="text-xs text-gray-500">{pendingTasks} pending</div>
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Settings */}
                    <Link 
                        to="/profile" 
                        className="group flex items-center px-3 py-2 md:px-4 md:py-3 hover:bg-purple-50 transition-colors gap-3 rounded-lg mx-1 text-sm"
                    >
                        <Settings className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <span className="font-medium text-gray-700 hidden md:inline">Settings</span>
                    </Link>

                    {/* Members */}
                    {selectedWorkspace && (
                        <Link 
                            to={`/workspace/${selectedWorkspace._id}/members`} 
                            className="group flex items-center px-3 py-2 md:px-4 md:py-3 hover:bg-indigo-50 transition-colors gap-3 rounded-lg mx-1 text-sm"
                        >
                            <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <span className="font-medium text-gray-700 hidden md:inline">Members</span>
                                <div className="hidden md:block text-xs text-gray-500 mt-1">
                                    {selectedWorkspace.members?.length || 0} members
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Footer - Version Info */}
            <div className="border-t border-gray-100 pt-2 pb-4 px-2 md:px-4 text-center">
                <div className="text-xs text-gray-400">
                    <div>ProjectFlow v1.0</div>
                    <div className="mt-1">© 2024</div>
                </div>
            </div>

            {/* Mobile Overlay for Dropdown */}
            {workspaceDropdownOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setWorkspaceDropdownOpen(false)}
                />
            )}
        </div>
    );
};

export default Sidebar;