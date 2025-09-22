import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Settings, User, ChevronDown, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => { 
    const navigate = useNavigate();
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Default user data nếu không có props
    const currentUser = user || {
        name: "User Name",
        email: "user@example.com",
        avatar: "U"
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        console.log("Logging out...");
        setIsUserDropdownOpen(false);
        if (onLogout) {
            onLogout(); // Gọi function từ Layout/parent component
        }
        // navigate('/login');
    };

    const handleProfileSetting = () => {
        console.log("Opening profile settings...");
        setIsUserDropdownOpen(false);
        navigate('/profile');
    };
    
    return (
        <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 font-sans'>
            <div className='flex items-center justify-between px-4 py-3 md:px-6 max-w-7xl mx-auto'>
                {/*LOGO*/}
                <div className='flex items-center gap-2 cursor-pointer group'
                     onClick={() => navigate('/')}>  
                    {/*LOGO*/}
                    <div className='relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-lg group-hover:shadow-purple-300/50 group-hover:scale-105 transition-all duration-300'>
                        <Zap className='w-6 h-6 text-white' />
                    </div>
                    <span className='text-2xl font-bold bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent group-hover:from-fuchsia-400 group-hover:via-purple-400 group-hover:to-indigo-400 transition-all duration-300'>
                        TaskFlow
                    </span>
                </div>
                
                {/* Right Section - Settings and User */}
                <div className='flex items-center gap-3'>
                    {/* Settings Button */}
                    <button 
                        className='p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition-all duration-300 group'
                        onClick={() => {/* Handle settings click */}}
                    >
                        <Settings className='w-6 h-6 group-hover:rotate-90 transition-transform duration-300' />
                    </button>

                    {/* User Dropdown */}
                    <div className='relative' ref={dropdownRef}>
                        <button 
                            className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 group'
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                        >
                            {/* User Avatar */}
                            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm'>
                                {currentUser.avatar}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isUserDropdownOpen && (
                            <div className='absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                                {/* Profile Setting */}
                                <button
                                    onClick={handleProfileSetting}
                                    className='flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                                >
                                    <Settings className='w-5 h-5 text-gray-500' />
                                    <span className='font-medium'>Profile Setting</span>
                                </button>

                                {/* Divider */}
                                <hr className='my-1 border-gray-100' />

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className='flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200'
                                >
                                    <LogOut className='w-5 h-5' />
                                    <span className='font-medium'>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar