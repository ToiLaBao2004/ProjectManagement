import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';

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

    // Kiểm tra token khi app khởi động
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token && location.pathname !== '/login' && location.pathname !== '/signup') {
            navigate('/login', { replace: true });
        }
    }, [navigate, location.pathname]);

    // Xử lý Google callback
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userData = urlParams.get('user');
        
        if (token && userData) {
            try {
                // Lưu token
                localStorage.setItem('token', token);
                
                // Parse user data từ URL params
                const user = JSON.parse(decodeURIComponent(userData));
                
                // Set user state
                setCurrentUser(user);
                
                // Clear URL params và redirect về home
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

    // Protected Route Component
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

    // Auth Wrapper cho Login/Signup
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
            } />
            <Route path='/' element={<ProtectedLayout />}>
                <Route index element={<div>Home Page Content</div>} />
                {/* Thêm các route khác ở đây */}
            </Route>
        </Routes>
    );
};

export default App;