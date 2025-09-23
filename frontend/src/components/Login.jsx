import React, { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

const INITIAL_FORM = { email: "", password: "" };

const Login = ({ onSwitchMode, onLogin }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const { data } = await axios.post(`${API_URL}/user/login`, formData);

            // Lưu token vào localStorage
            localStorage.setItem("token", data.token);

            // Gọi callback để set user trong App.jsx
            if (onLogin) {
                onLogin(data.user);
            }

            setMessage({ text: "Login successful!", type: "success" });

            // Navigate về home
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            setMessage({
                text: err.response?.data?.message || "An error occurred. Please try again.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect đến server Google login
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">
            <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
                    <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Login to continue managing your tasks
                </p>
            </div>

            {message.text && (
                <div
                    className={`p-2 mb-4 text-sm rounded ${
                        message.type === "success"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                    }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center border rounded px-3 py-2">
                    <Mail className="text-blue-500 w-5 h-5 mr-2" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full focus:outline-none text-sm text-gray-700"
                        required
                    />
                </div>

                <div className="flex items-center border rounded px-3 py-2">
                    <Lock className="text-blue-500 w-5 h-5 mr-2" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full focus:outline-none text-sm text-gray-700"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? "Logging In..." : "Login"}
                </button>
            </form>

            <div className="my-4 flex items-center justify-center">
                <div className="border-t w-full"></div>
                <span className="px-2 text-gray-500 text-sm">OR</span>
                <div className="border-t w-full"></div>
            </div>

            <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={loading}
            >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{" "}
                <button
                    onClick={onSwitchMode}
                    className="text-sky-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                    disabled={loading}
                >
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default Login;