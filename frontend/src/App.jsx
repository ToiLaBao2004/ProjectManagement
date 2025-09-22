import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import GoogleCallback from './pages/GoogleCallback'
import { authAPI } from './services/authService'

const App = () => {
    const handleLogout = () => {
        authAPI.logout();
        window.location.href = '/login';
    };

    const currentUser = authAPI.getCurrentUser();

    return (
        <Router>
            <Routes>
                {/* Auth Routes (no layout) */}
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                
                {/* Protected Routes (with layout) */}
                <Route path="/*" element={
                    <Layout user={currentUser} onLogout={handleLogout}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<div className="p-8 text-center text-gray-600">Profile page coming soon...</div>} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
        </Router>
    )
}

export default App