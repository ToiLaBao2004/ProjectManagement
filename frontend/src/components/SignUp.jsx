import React, { useState } from "react";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:4000";
const INITIAL_FORM = { name: "", email: "", password: "" };

const SignUp = ({ onSwitchMode }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const { data } = await axios.post(`${API_URL}/user/register`, formData);
            console.log("Signup successful", data);
            setMessage({
                text: "Registration successful! You can now log in.",
                type: "success",
            });
            setFormData(INITIAL_FORM);
        } catch (err) {
            console.error("Signup error:", err);
            setMessage({
                text:
                    err.response?.data?.message ||
                    "An error occurred. Please try again.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white shadow-lg border border-blue-100 rounded-xl p-8">
            {/* Header */}
            <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full
            mx-auto flex items-center justify-center mb-4">
                    <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Join ProjectFlow to manage your Projects
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div
                    className={`p-2 mb-4 rounded text-sm ${message.type === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="flex items-center border rounded px-3 py-2">
                    <User className="text-blue-500 w-5 h-5 mr-2" />
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full focus:outline-none text-sm text-gray-700"
                        required
                    />
                </div>

                {/* Email */}
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

                {/* Password */}
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

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
              text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Signing Up..." : <><UserPlus className="w-4 h-4" /> Sign Up</>}
                </button>
            </form>

            {/* Switch to login */}
            <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <button
                    onClick={onSwitchMode}
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                >
                    Login
                </button>
            </p>
        </div>
    );
};

export default SignUp;
