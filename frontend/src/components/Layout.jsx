import React from 'react'
import Navbar from './Navbar'

const Layout = ({ children, onLogout, user }) => {
    // Default user data - có thể lấy từ context hoặc authentication state
    const currentUser = user || {
        name: "User Name", 
        email: "user@example.com",
        avatar: "U"
    };

    // Handle logout logic
    const handleLogout = () => {
        console.log("User logging out from Layout...");
        // Thực hiện các tác vụ logout như:
        // - Clear localStorage/sessionStorage
        // - Reset authentication state
        // - Redirect to login page
        
        if (onLogout) {
            onLogout(); // Gọi callback từ parent component (App.jsx)
        }
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <Navbar user={currentUser} onLogout={handleLogout} />
            {children}
        </div>
    )
}

export default Layout
