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
                navigate('/', { replace: true });
            } catch (error) {
                console.error('Error processing Google callback:', error);
                navigate('/login', { replace: true });
            }
        }
    }, [location.search, navigate]);

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
                <Route index element={<div>Home Page Content</div>} />
                <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
                <Route path="/workspace/:workspaceId/project/:projectId" element={<ProjectPage />} />
                <Route path="/workspace/:workspaceId/settings" element={<WorkspaceSettings />} />
                <Route path="/workspace/:workspaceId/members" element={<WorkspaceMembers />} />
                <Route path="/my-tasks" element={<MyTasksPage />} />
                <Route path="/task/:taskId" element={<TaskDetail />} />
            </Route>
        </Routes>
    );
};

export default App;