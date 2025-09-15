import Workspace from "../models/workspaceModel.js";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";
import User from "../models/userModel.js";

export async function createWorkspace(req, res) {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Workspace name is required.' });
        }
        const workspace = new Workspace({
            name,
            description,
            owner: req.user.id,
            members: [{ user: req.user.id, role: 'admin' }]
        });
        await workspace.save();
        res.status(201).json({ success: true, workspace });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// Lấy danh sách workspace của người dùng hiện tại
export async function getMyWorkspaces(req, res) {
    try {
        const workspaces = await Workspace.find({ 'members.user': req.user.id }).populate('owner', 'name email');
        res.status(200).json({ success: true, workspaces });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function getWorkspaceById(req, res) {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId).populate('owner', 'name email').populate('members.user', 'name email');
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }
        const isMember = workspace.members.some(member => member.user._id.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this workspace.' });
        }
        res.status(200).json({ success: true, workspace });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const INVITE_SECRET = process.env.INVITE_SECRET;

// Mời thành viên qua email
export async function inviteMemberByEmail(req, res) {
    try {
        const { workspaceId } = req.params; // workspaceId
        const { email } = req.body;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace not found." });
        }

        // chỉ admin mới được mời
        const currentUser = workspace.members.find(member => member.user.toString() === req.user.id);
        if (!currentUser || currentUser.role !== "admin") {
            return res.status(403).json({ success: false, message: "Permission denied." });
        }

        // kiểm tra đã là member chưa
        const user = await User.findOne({ email });
        if (user) {
            const alreadyMember = workspace.members.some(
                member => member.user.toString() === user._id.toString()
            );
            if (alreadyMember) {
                return res.status(400).json({ success: false, message: "User is already a member." });
            }
        }

        // tạo token mời (JWT)
        const token = jwt.sign(
            { workspaceId: workspace._id, email },
            INVITE_SECRET,
            { expiresIn: "24h" }
        );
        // gửi email
        const inviteLink = `${process.env.BACKEND_URL}/workspace/invite/accept?token=${encodeURIComponent(token)}`;
        await sendMail(email, "Workspace Invitation", `
            Bạn được mời tham gia workspace "${workspace.name}".
            Nhấn link để chấp nhận: ${inviteLink}
        `);
        res.status(200).json({ success: true, message: "Invitation sent." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error." });
    }
}

export async function acceptInvite(req, res) {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: "Token missing" });
    try {
        const decoded = jwt.verify(token, INVITE_SECRET);
        console.log("DECODED:", decoded);
        const { email, workspaceId } = decoded;

        // Check workspace tồn tại
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ success: false, message: "Workspace not found" });

        // Check user tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.json({ success: true, message: "Redirect to Google login to complete invite", email });
        }

        // Add vào members nếu chưa có
        const alreadyMember = workspace.members.some(member => member.user.toString() === existingUser._id.toString());
        if (!alreadyMember) {
            workspace.members.push({ user: existingUser._id, role: "member" });
            await workspace.save();
        }

        return res.json({ success: true, message: "Joined workspace successfully" });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
}

export async function updateWorkspace(req, res) {
    try {
        const { workspaceId } = req.params;
        const { name, description } = req.body;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }
        const isAdmin = workspace.members.some(member => member.user.toString() === req.user.id && member.role === 'admin');
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Only admins can update the workspace.' });
        }
        if (name) workspace.name = name;
        if (description) workspace.description = description;
        await workspace.save();
        res.status(200).json({ success: true, workspace });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function removeMember(req, res) {
    try {
        const { workspaceId } = req.params;
        const { userId } = req.body;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace not found." });
        }
        const isAdmin = workspace.members.some(member => member.user.toString() === req.user.id && member.role === 'admin');
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: "Only admins can remove members." });
        }
        workspace.members = workspace.members.filter(member => member.user.toString() !== userId);
        await workspace.save();
        res.status(200).json({ success: true, message: "Member removed." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error." });
    }
}

export async function updateMemberRole(req, res) {
    try {
        const { workspaceId } = req.params;
        const { userId, role } = req.body;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }
        const isAdmin = workspace.members.some(member => member.user.toString() === req.user.id && member.role === 'admin');
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Only admins can update member roles.' });
        }
        const member = workspace.members.find(member => member.user.toString() === userId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found in workspace.' });
        }
        member.role = role;
        await workspace.save();
        res.status(200).json({ success: true, message: 'Member role updated.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

export async function deleteWorkspace(req, res) {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }
        const isOwner = workspace.owner.toString() === req.user.id;
        if (!isOwner) {
            return res.status(403).json({ success: false, message: 'Only Owners can delete the workspace.' });
        }
        await workspace.deleteOne();
        res.status(200).json({ success: true, message: 'Workspace deleted.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}