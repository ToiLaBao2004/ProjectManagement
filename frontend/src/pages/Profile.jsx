import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState({ name: '', email: '', isGoogleUser: false });
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:4000';

    // Fetch current user data
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const { data } = await axios.get(`${API_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setUser(data.user);
                    setFormData({ name: data.user.name, email: data.user.email });
                } else {
                    setErrors({ general: data.message });
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setErrors({ general: 'Failed to load user data.' });
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    // Handle profile form input changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
        setSuccessMessage('');
    };

    // Handle password form input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
        setSuccessMessage('');
    };

    // Validate profile form
    const validateProfileForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required.';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format.';
        }
        return newErrors;
    };

    // Validate password form
    const validatePasswordForm = () => {
        const newErrors = {};
        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required.';
        }
        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required.';
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = 'New password must be at least 8 characters long.';
        }
        return newErrors;
    };

    // Handle profile form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateProfileForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(
                `${API_URL}/user/profile`,
                { name: formData.name, email: formData.email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setUser(data.user);
                setSuccessMessage('Profile updated successfully.');
                setErrors({});
            } else {
                setErrors({ general: data.message });
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setErrors({ general: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle password form submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validatePasswordForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(
                `${API_URL}/user/password`,
                { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setSuccessMessage('Password changed successfully.');
                setPasswordData({ currentPassword: '', newPassword: '' });
                setErrors({});
            } else {
                setErrors({ general: data.message });
            }
        } catch (err) {
            console.error('Error changing password:', err);
            setErrors({ general: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Profile Settings
                </h2>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500" />
                        <span className="ml-2 text-sm text-gray-500">Loading...</span>
                    </div>
                )}

                {/* Error Message */}
                {errors.general && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-sm text-green-600">{successMessage}</p>
                    </div>
                )}

                {!loading && (
                    <div className="space-y-8">
                        {/* Profile Form */}
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700">Update Profile</h3>
                            <div>
                                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <User className="w-4 h-4" />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleProfileChange}
                                    className={`mt-1 w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors`}
                                    placeholder="Enter your name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed"
                            >
                                Update Profile
                            </button>
                        </form>

                        {/* Password Form */}
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700">Change Password</h3>
                            {user.isGoogleUser ? (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        Password changes are disabled for Google OAuth accounts. Please manage your password via your Google account.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            <Lock className="w-4 h-4" />
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={`mt-1 w-full px-4 py-2 border ${errors.currentPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors`}
                                            placeholder="Enter current password"
                                        />
                                        {errors.currentPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            <Lock className="w-4 h-4" />
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`mt-1 w-full px-4 py-2 border ${errors.newPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors`}
                                            placeholder="Enter new password"
                                        />
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed"
                                    >
                                        Change Password
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;