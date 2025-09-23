import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

const Layout = ({ user, onLogout }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar - Luôn ở trên cùng */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar user={user} onLogout={onLogout} />
            </div>

            {/* Sidebar */}
            <div className="fixed left-0 top-16 bottom-0 w-16 md:w-64 z-40">
                <Sidebar user={user} />
            </div>

            {/* Main content - Padding cho navbar và sidebar */}
            <div className="flex-1 flex flex-col ml-0 md:ml-64 pt-16">
                {/* Outlet for page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout