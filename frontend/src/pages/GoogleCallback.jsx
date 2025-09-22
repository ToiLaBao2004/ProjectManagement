import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/authService';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = () => {
            try {
                // Lấy data từ URL params
                const urlParams = new URLSearchParams(window.location.search);
                const encodedData = urlParams.get('data');
                const error = urlParams.get('error');
                
                if (error) {
                    setError(error);
                    setLoading(false);
                    return;
                }
                
                if (encodedData) {
                    const data = JSON.parse(decodeURIComponent(encodedData));
                    
                    // Save user data (token và user info sẽ được lưu trong function này)
                    authAPI.saveUserData({ success: true, ...data });
                    
                    // Get intended URL or default to dashboard
                    const intendedUrl = sessionStorage.getItem('preGoogleLoginUrl') || '/dashboard';
                    sessionStorage.removeItem('preGoogleLoginUrl');
                    
                    console.log('Google login successful, redirecting to:', intendedUrl);
                    console.log('Saved user data:', data.user);
                    
                    // Redirect to dashboard
                    navigate(intendedUrl);
                } else {
                    setError('No authentication data received');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Google callback error:', err);
                setError('Authentication failed. Please try again.');
                setLoading(false);
            }
        };

        handleCallback();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Completing Google Sign-in...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default GoogleCallback;
