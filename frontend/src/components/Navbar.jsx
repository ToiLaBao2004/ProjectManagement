import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    ChevronDown, 
    LogOut, 
    Settings, 
    Bell, 
    CheckCircle,
    X,
    Zap 
} from 'lucide-react';
import axios from 'axios';

const Navbar = ({ user = {}, onLogout }) => {
    const menuref = useRef(null);
    const notificationRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_URL = "http://localhost:4000";

    // Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                onLogout();
                return;
            }

            const { data } = await axios.get(`${API_URL}/notification/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNotifications(data.notifications || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
            if (err.response?.status === 401) {
                onLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Mark single notification as read
    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(
                `${API_URL}/notification/mark-as-read`,
                { notificationId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notif._id === notificationId 
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(
                `${API_URL}/notification/mark-all-read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (data.success) {
                // Update local state - set all notifications to read
                setNotifications(prev => 
                    prev.map(notif => ({ ...notif, isRead: true }))
                );
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Toggle menu handlers
    const handleMenuToggle = () => setMenuOpen((prev) => !prev);
    const handleNotificationToggle = () => {
        setNotificationOpen((prev) => !prev);
        if (!notificationOpen) {
            fetchNotifications(); // Fetch when opening
        }
    };

    const handleLogout = () => {
        setMenuOpen(false);
        setNotificationOpen(false);
        onLogout();
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuref.current && !menuref.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm
        border-b border-gray-200 font-sans'>
            <div className='flex items-center justify-between px-4 py-3 md:px-6 max-w-7xl mx-auto'>
                {/* LOGO */}
                <div className='flex items-center gap-2 cursor-pointer group'
                    onClick={() => navigate('/')}>
                    <div className='relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br
                    from-sky-400 via-blue-500 to-indigo-500 shadow-lg group-hover:shadow-purple-300/50
                    group-hover:scale-105 transition-all duration-300'>
                        <Zap className='w-6 h-6 text-white'/>
                        <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full shadow-md
                        animate-ping'/>
                    </div>
                    <span className='text-2xl font-extrabold bg-gradient-to-br from-sky-400 via-blue-500
                    to-indigo-500 bg-clip-text text-transparent tracking-wide'>
                        Project Flow
                    </span>
                </div>

                {/* RIGHT SIDE */}
                <div className='flex items-center gap-4'>
                    {/* NOTIFICATION BUTTON */}
                    <div ref={notificationRef} className='relative'>
                        <button 
                            onClick={handleNotificationToggle}
                            className='relative p-2 text-gray-600 hover:text-sky-400 transition-colors duration-300
                            hover:bg-sky-50 rounded-full group'
                        >
                            <Bell className='w-5 h-5'/>
                            {unreadCount > 0 && (
                                <div className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse'>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                            )}
                        </button>

                        {/* NOTIFICATION DROPDOWN */}
                        {notificationOpen && (
                            <div className='absolute top-14 right-0 w-80 max-h-96 bg-white rounded-2xl
                            shadow-xl border border-purple-100 z-50 overflow-hidden animate-fadeIn'>
                                {/* Header */}
                                <div className='px-4 py-3 border-b border-gray-100 bg-gray-50'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
                                            <Bell className='w-4 h-4 text-sky-500'/>
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={() => {
                                                    markAllAsRead();
                                                    setNotificationOpen(false);
                                                }}
                                                className='text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors'
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    {loading && (
                                        <div className='flex items-center justify-center py-4'>
                                            <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-500'/>
                                            <span className='ml-2 text-sm text-gray-500'>Loading...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Notifications List */}
                                <div className='max-h-80 overflow-y-auto'>
                                    {error ? (
                                        <div className='px-4 py-6 text-center text-sm text-gray-500'>
                                            <p>{error}</p>
                                            <button 
                                                onClick={fetchNotifications}
                                                className='mt-2 text-blue-600 hover:text-blue-700 text-xs font-medium'
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className='px-4 py-8 text-center'>
                                            <Bell className='w-12 h-12 mx-auto text-gray-300 mb-2'/>
                                            <p className='text-sm text-gray-500'>No notifications yet</p>
                                            <p className='text-xs text-gray-400'>You'll see updates here</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification._id}
                                                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer
                                                ${!notification.isRead ? 'bg-blue-50 border-blue-100' : ''}`}
                                                onClick={() => {
                                                    if (!notification.isRead) {
                                                        markAsRead(notification._id);
                                                    }
                                                }}
                                            >
                                                <div className='flex items-start gap-3'>
                                                    {/* Icon */}
                                                    <div className='flex-shrink-0 pt-0.5'>
                                                        {notification.isRead ? (
                                                            <CheckCircle className='w-5 h-5 text-gray-400'/>
                                                        ) : (
                                                            <Bell className='w-5 h-5 text-blue-500 animate-pulse'/>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <div className='flex-1 min-w-0'>
                                                        <p className={`text-sm font-medium break-words ${
                                                            !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                                                        }`}>
                                                            {notification.title || notification.message}
                                                        </p>
                                                        <p className='text-xs text-gray-500 mt-1'>
                                                            {notification.createdAt ? 
                                                                new Date(notification.createdAt).toLocaleString() : 
                                                                'Just now'
                                                            }
                                                        </p>
                                                        {notification.message && (
                                                            <p className='text-xs text-gray-500 mt-1 line-clamp-2'>
                                                                {notification.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Unread indicator */}
                                                    {!notification.isRead && (
                                                        <div className='flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5 animate-pulse'/>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Footer */}
                                {notifications.length > 0 && (
                                    <div className='px-4 py-2 border-t border-gray-100'>
                                        <button 
                                            onClick={() => navigate('/notifications')}
                                            className='w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-1 rounded transition-colors'
                                        >
                                            View all notifications
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SETTINGS BUTTON */}
                    <button 
                        className='p-2 text-gray-600 hover:text-sky-400 transition-colors duration-300
                        hover:bg-sky-50 rounded-full'
                        onClick={() => navigate('/profile')}
                    >
                        <Settings className='w-5 h-5'/>
                    </button>

                    {/* USER DROPDOWN */}
                    <div ref={menuref} className='relative'>
                        <button 
                            onClick={handleMenuToggle}
                            className='flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer 
                            hover:bg-sky-50 transition-colors duration-300 border border-transparent hover:border-sky-200'
                        >
                            <div className='relative'>
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt="Avatar" 
                                        className="w-9 h-9 rounded-full shadow-sm"
                                    />
                                ) : (
                                    <div className='w-8 h-8 flex items-center justify-center rounded-full
                                    bg-gradient-to-br from-sky-400 to-sky-600 text-white font-semibold shadow-md'>
                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400
                                rounded-full border-2 border-white animate-pulse'/>
                            </div>
                            <div className='text-left hidden md:block'>
                                <p className='text-sm font-medium text-gray-800'>{user.name}</p>
                                <p className='text-xs font-normal text-gray-500'>{user.email}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300
                                ${menuOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        {menuOpen && (
                            <ul className='absolute top-14 right-0 w-56 bg-white rounded-2xl
                            shadow-xl border border-purple-100 z-50 overflow-hidden animate-fadeIn'>
                                <li className='p-2'>
                                    <button 
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate('/profile');
                                        }}
                                        className='w-full px-4 py-2.5 text-left hover:bg-purple-50 text-sm
                                        text-gray-700 transition-colors flex items-center gap-2 group' 
                                        role='menuitem'
                                    >
                                        <Settings className='w-4 h-4 text-gray-700'/>
                                        Profile Setting
                                    </button>
                                </li>
                                <li className='p-2'>
                                    <button 
                                        onClick={handleLogout} 
                                        className='flex w-full items-center gap-2 rounded-lg px-3 py-2 
                                        text-sm hover:bg-red-50 text-red-600'
                                    >
                                        <LogOut className='w-4 h-4'/>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;