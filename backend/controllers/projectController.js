import Project from '../models/projectModel.js';
import Workspace from '../models/workspaceModel.js';

export async function createProject(req, res) {
    try {
        const { workspaceId } = req.params;
        const { name, description } = req.body;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required.' });
        }
        const currentUser = workspace.members.find(member => member.user.toString() === req.user.id);
        if (!currentUser && currentUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only workspace admins can create projects.' });
        }
        const project = new Project({
            workspace: workspaceId,
            name,
            description,
            owner: req.user.id,
            members: [{ user: req.user.id, role: 'manager' }]
        });
        await project.save();
        res.status(201).json({ success: true, project });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function getProjects(req, res) {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }

        // Kiểm tra user có phải là thành viên workspace không
        const isMemberOfWorkspace = workspace.members.some(
            member => member.user.toString() === req.user.id
        );
        if (!isMemberOfWorkspace) {
            return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this workspace.' });
        }

        // Lấy project mà user là member
        const projects = await Project.find({ 
            workspace: workspaceId, 
            'members.user': req.user.id  // chỉ lấy project mà user là member
        })
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

        res.status(200).json({ success: true, projects });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function getProjectById(req, res) {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId).populate('owner', 'name email').populate('members.user', 'name email');
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        const workspace = await Workspace.findById(project.workspace);
        const isMember = workspace.members.some(member => member.user.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this workspace.' });
        }
        res.status(200).json({ success: true, project });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function addMemberToProject(req, res) {
    try {
        const { workspaceId, projectId } = req.params;
        const { userId, role } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        const isManager = project.members.some(member => member.user.toString() === req.user.id && member.role === 'manager');
        if (!isManager && project.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only project managers can add members.' });
        }
        const workspace = await Workspace.findById(workspaceId);
        const isWorkspaceMember = workspace.members.some(member => member.user.toString() === userId);
        if (!isWorkspaceMember) {
            return res.status(400).json({ success: false, message: 'User must be a member of the workspace to be added to the project.' });
        }
        const isAlreadyMember = project.members.some(member => member.user.toString() === userId);
        if (isAlreadyMember) {
            return res.status(400).json({ success: false, message: 'User is already a member of the project.' });
        }
        project.members.push({ user: userId, role: role || 'developer' });
        await project.save();
        res.status(200).json({ success: true, project });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function editMemberRole(req, res) {
    try {
        const { projectId } = req.params;
        const { userId, role } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        // Kiểm tra quyền của người thực hiện: phải là manager hoặc owner
        const isManager = project.members.some(
            member => member.user.toString() === req.user.id && member.role === 'manager'
        );
        const isOwner = project.owner.toString() === req.user.id;
        if (!isManager && !isOwner) {
            return res.status(403).json({ success: false, message: 'Only project managers or owner can update member roles.' });
        }

        // Tìm member cần cập nhật
        const member = project.members.find(member => member.user.toString() === userId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found in project.' });
        }

        // Ngăn không đổi role nếu member là owner
        if (userId === project.owner.toString()) {
            return res.status(403).json({ success: false, message: 'Cannot change the role of the project owner.' });
        }

        // Cập nhật role
        member.role = role;
        await project.save();

        res.status(200).json({ success: true, message: 'Member role updated.', project });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function removeMemberFromProject(req, res) {
    try {
        const { projectId } = req.params;
        const { userId } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        // Kiểm tra quyền: phải là manager hoặc owner
        const isManager = project.members.some(
            member => member.user.toString() === req.user.id && member.role === 'manager'
        );
        const isOwner = project.owner.toString() === req.user.id;
        if (!isManager && !isOwner) {
            return res.status(403).json({ success: false, message: 'Only project managers or owner can remove members.' });
        }

        // Ngăn xóa owner
        if (userId === project.owner.toString()) {
            return res.status(403).json({ success: false, message: 'Cannot remove the project owner.' });
        }

        // Ngăn manager xóa chính mình (tuỳ chọn)
        if (userId === req.user.id) {
            return res.status(403).json({ success: false, message: 'Managers cannot remove themselves.' });
        }

        const member = project.members.find(member => member.user.toString() === userId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found in project.' });
        }

        // Xóa member
        project.members = project.members.filter(member => member.user.toString() !== userId);
        await project.save();

        res.status(200).json({ success: true, message: 'Member removed from project.', project });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function getSprintsOfProject(req, res) {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId).populate('sprints');
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        const workspace = await Workspace.findById(project.workspace);
        const isMember = workspace.members.some(member => member.user.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this workspace.' });
        }
        res.status(200).json({ success: true, sprints: project.sprints });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function addSprintToProject(req, res) {
    try {
        const { projectId } = req.params;
        const { name, startDate, endDate } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        const isManager = project.members.some(member => member.user.toString() === req.user.id && member.role === 'manager');
        if (!isManager && project.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only project managers can add sprints.' });
        }
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Name, startDate, and endDate are required.' });
        }
        const sprint = { name, startDate, endDate };
        project.sprints.push(sprint);
        await project.save();
        res.status(200).json({ success: true, message: 'Sprint added to project.', project });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function removeSprintFromProject(req, res) {
    try {
        const { projectId } = req.params;
        const { name } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        const isManager = project.members.some(member => member.user.toString() === req.user.id && member.role === 'manager');
        if (!isManager && project.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only project managers can remove sprints.' });
        }
        const sprint = project.sprints.find(sprint => sprint.name === name);
        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found in project.' });
        }
        project.sprints = project.sprints.filter(s => s.name !== name);
        await project.save();
        res.status(200).json({ success: true, message: 'Sprint removed from project.', project });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function updateProject(req, res) {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        const isManager = project.members.some(member => member.user.toString() === req.user.id && member.role === 'manager');
        if (!isManager && project.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only project managers can update project details.' });
        }
        if (name) project.name = name;
        if (description) project.description = description;
        await project.save();
        res.status(200).json({ success: true, message: 'Project updated.', project });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}