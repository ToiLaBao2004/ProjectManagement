import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import WorkspacePage from './pages/WorkspacePage';
import ProjectPage from './pages/ProjectPage';
import MyTasksPage from './pages/MyTasksPage';
import WorkspaceSettings from './pages/WorkspaceSettingPage'; // New
import WorkspaceMembers from './pages/WorkspaceMembersPage'; // New
import TaskDetail from './pages/TaskDetail'
import Profile from "./pages/Profile";
import ProjectSettings from "./pages/ProjectSettings";
import SprintPage from "./pages/SprintPage"
import Dashboard from "./pages/Dashboard"

const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    // Check token on app start
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token && location.pathname !== '/login' && location.pathname !== '/signup') {
            navigate('/login', { replace: true });
        }
    }, [navigate, location.pathname]);

    // Handle Google callback
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userData = urlParams.get('user');

        if (token && userData) {
            try {
                localStorage.setItem('token', token);
                const user = JSON.parse(decodeURIComponent(userData));
                setCurrentUser(user);

                // 🔹 Check invite token sau khi login bằng Google
                const inviteToken = localStorage.getItem("inviteToken");
                if (inviteToken) {
                    axios.get(`${API_URL}/workspace/invite/accept?token=${inviteToken}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(() => {
                        localStorage.removeItem("inviteToken");
                        navigate('/', { replace: true });
                    });
                } else {
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Error processing Google callback:', error);
                navigate('/login', { replace: true });
            }
        }
    }, [location.search, navigate]);

    // App.jsx
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const inviteToken = urlParams.get('inviteToken');
        if (inviteToken) {
            localStorage.setItem('inviteToken', inviteToken);
            // Xóa param khỏi URL để gọn gàng
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, location.pathname, navigate]);

    const handleAuthSubmit = (data) => {
        const user = {
            email: data.email,
            name: data.name || 'User',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`
        };
        setCurrentUser(user);
        navigate('/', { replace: true });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        navigate('/login', { replace: true });
    };

    // Protected Layout
    const ProtectedLayout = () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login', { replace: true });
            return null;
        }

        return (
            <Layout user={currentUser} onLogout={handleLogout}>
                <Outlet />
            </Layout>
        );
    };

    // Auth Wrapper for Login/Signup
    const AuthWrapper = ({ children }) => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/', { replace: true });
            return null;
        }
        return children;
    };

    return (
        <Routes>
            <Route 
                path='/login' 
                element={
                    <AuthWrapper>
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                            <Login 
                                onSubmit={handleAuthSubmit} 
                                onSwitchMode={() => navigate('/signup')} 
                                onLogin={(user) => setCurrentUser(user)}
                            />
                        </div>
                    </AuthWrapper>
                } 
            />
            <Route 
                path='/signup' 
                element={
                    <AuthWrapper>
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                            <SignUp 
                                onSubmit={handleAuthSubmit} 
                                onSwitchMode={() => navigate('/login')} 
                            />
                        </div>
                    </AuthWrapper>
                } 
            />
            <Route path='/' element={<ProtectedLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
                <Route path="/workspace/:workspaceId/project/:projectId" element={<ProjectPage />} />
                <Route path="/workspace/:workspaceId/settings" element={<WorkspaceSettings />} />
                <Route path="/workspace/:workspaceId/members" element={<WorkspaceMembers />} />
                <Route path="/my-tasks" element={<MyTasksPage />} />
                <Route path="/task/:taskId" element={<TaskDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/workspace/:workspaceId/project/:projectId/settings" element={<ProjectSettings />} />
                <Route path="/task/sprint/:sprintId" element={<SprintPage />} />
            </Route>
        </Routes>
    );
};

export default App;