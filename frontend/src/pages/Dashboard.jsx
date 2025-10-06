import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, FolderPlus, Users } from 'lucide-react';

const API_URL = "http://localhost:4000";

const Dashboard = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch toàn bộ workspace của user
    useEffect(() => {
        const fetchWorkspaces = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const res = await axios.get(`${API_URL}/workspace/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setWorkspaces(res.data.workspaces || []);
            } catch (err) {
                console.error("Error fetching workspaces:", err);
                setError(err.response?.data?.message || "Failed to load workspaces.");
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Your Workspaces</h2>
                <p className="text-gray-600 mt-1">
                    Manage all your workspaces and projects in one place.
                </p>
            </div>

            {/* Workspaces List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <FolderPlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h4 className="text-lg font-medium mb-2">No workspaces yet</h4>
                        <p>Create or join a workspace to get started!</p>
                    </div>
                ) : (
                    workspaces.map(ws => (
                        <div
                            key={ws._id}
                            onClick={() => navigate(`/workspace/${ws._id}`)}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                    {ws.name}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Users className="w-4 h-4" />
                                    {ws.members?.length || 0}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {ws.description || "No description"}
                            </p>
                            <div className="text-xs text-gray-500">
                                ID: {ws._id}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
