import React from 'react'

const Dashboard = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Projects</h2>
                    <p className="text-gray-600">Manage your projects here</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Tasks</h2>
                    <p className="text-gray-600">Track your tasks here</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
                    <p className="text-gray-600">View your notifications here</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard