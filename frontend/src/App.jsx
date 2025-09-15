import React, { useState } from 'react';
import WorkspaceList from './pages/WorkspaceList';
import CreateWorkspace from './pages/CreateWorkspace';

function App() {
    // Giả sử token được lấy từ đăng nhập
    const [token] = useState('your_jwt_token_here');

    return (
        <div>
            <h1>Workspace Management</h1>
            <CreateWorkspace token={token} />
            <WorkspaceList token={token} />
        </div>
    );
}

export default App;