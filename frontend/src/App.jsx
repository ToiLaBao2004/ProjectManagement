import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import GoogleCallback from "./pages/GoogleCallback";
import { authAPI } from "./services/authService";

const App = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(() => {
        // ưu tiên lấy user từ authAPI
        const apiUser = authAPI.getCurrentUser();
        if (apiUser) return apiUser;

        // fallback: lấy từ localStorage
        const stored = localStorage.getItem("currentUser");
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        } else {
            localStorage.removeItem("currentUser");
        }
    }, [currentUser]);

    const handleAuthSubmit = (data) => {
        const user = {
            email: data.email,
            name: data.name || "User",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                data.name || "User"
            )}&background=random`,
        };
        setCurrentUser(user);
        navigate("/", { replace: true });
    };

    const handleLogout = () => {
        authAPI.logout(); // clear từ API
        localStorage.removeItem("token");
        setCurrentUser(null);
        navigate("/login", { replace: true });
    };

    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route
                    path="/login"
                    element={
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <Login
                                onSubmit={handleAuthSubmit}
                                onSwitchMode={() => navigate("/signup")}
                            />
                        </div>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <SignUp
                                onSubmit={handleAuthSubmit}
                                onSwitchMode={() => navigate("/login")}
                            />
                        </div>
                    }
                />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />

                {/* Protected Routes */}
                <Route
                    path="/*"
                    element={
                        <Layout user={currentUser} onLogout={handleLogout}>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route
                                    path="/profile"
                                    element={
                                        <div className="p-8 text-center text-gray-600">
                                            Profile page coming soon...
                                        </div>
                                    }
                                />
                            </Routes>
                        </Layout>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;