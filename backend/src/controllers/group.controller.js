import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import { getLinkPreview, getPlatformInfo } from "../lib/linkPreview.js";

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, memberIds, groupPic } = req.body;
        const adminId = req.user._id;

        if (!name) {
            return res.status(400).json({ message: "Group name is required" });
        }

        // Create group with admin as first member
        const newGroup = new Group({
            name,
            description: description || "",
            admin: adminId,
            members: [
                {
                    user: adminId,
                    role: "admin",
                },
            ],
        });

        // Add group picture if provided
        if (groupPic) {
            const uploadResponse = await cloudinary.uploader.upload(groupPic);
            newGroup.groupPic = uploadResponse.secure_url;
        }

        // Add other members if provided
        if (memberIds && memberIds.length > 0) {
            for (const memberId of memberIds) {
                const userExists = await User.findById(memberId);
                if (userExists) {
                    newGroup.members.push({
                        user: memberId,
                        role: "member",
                    });
                }
            }
        }

        await newGroup.save();

        // Populate members with user details
        await newGroup.populate([
            { path: "admin", select: "fullName email profilePic" },
            { path: "members.user", select: "fullName email profilePic" },
        ]);

        res.status(201).json(newGroup);
    } catch (error) {
        console.log("Error in createGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all groups for a user
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({
            "members.user": userId,
        }).populate([
            { path: "admin", select: "fullName email profilePic" },
            { path: "members.user", select: "fullName email profilePic" },
        ]);

        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getUserGroups:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get group details
export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId,
        }).populate([
            { path: "admin", select: "fullName email profilePic" },
            { path: "members.user", select: "fullName email profilePic" },
        ]);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in getGroupDetails:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add member to group
export const addMemberToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberId } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is admin
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        // Check if member already exists
        const memberExists = group.members.find(
            (member) => member.user.toString() === memberId
        );

        if (memberExists) {
            return res.status(400).json({ message: "Member already exists in group" });
        }

        // Add new member
        group.members.push({
            user: memberId,
            role: "member",
        });

        await group.save();

        await group.populate([
            { path: "admin", select: "fullName email profilePic" },
            { path: "members.user", select: "fullName email profilePic" },
        ]);

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in addMemberToGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove member from group
export const removeMemberFromGroup = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is admin
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can remove members" });
        }

        // Remove member
        group.members = group.members.filter(
            (member) => member.user.toString() !== memberId
        );

        await group.save();

        await group.populate([
            { path: "admin", select: "fullName email profilePic" },
            { path: "members.user", select: "fullName email profilePic" },
        ]);

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in removeMemberFromGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        // Check if user is member of the group
        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId,
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const messages = await GroupMessage.find({ groupId })
            .populate("senderId", "fullName email profilePic")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getGroupMessages:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Send message to group
export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { text, image, encryptedText, encryptedImage, iv, isEncrypted } = req.body;
        const senderId = req.user._id;

        // Check if user is member of the group
        const group = await Group.findOne({
            _id: groupId,
            "members.user": senderId,
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Check for URLs in text and generate link preview
        let linkPreview = null;
        if (text && !isEncrypted) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = text.match(urlRegex);
            if (urls && urls.length > 0) {
                try {
                    const preview = await getLinkPreview(urls[0]);
                    const platformInfo = getPlatformInfo(urls[0]);
                    linkPreview = {
                        ...preview,
                        platform: platformInfo,
                    };
                } catch (error) {
                    console.log("Error generating link preview:", error);
                }
            }
        }

        const newMessage = new GroupMessage({
            groupId,
            senderId,
            text,
            image: imageUrl,
            encryptedText,
            encryptedImage,
            iv,
            isEncrypted,
            linkPreview,
        });

        await newMessage.save();

        await newMessage.populate("senderId", "fullName email profilePic");

        // Emit to all group members
        const groupMembers = group.members.map((member) => member.user.toString());
        io.to(groupId).emit("newGroupMessage", newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendGroupMessage:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add reaction to group message
export const addGroupReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        if (!emoji) {
            return res.status(400).json({ message: "Emoji is required" });
        }

        const message = await GroupMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
            (reaction) => reaction.userId.toString() === userId.toString() && reaction.emoji === emoji
        );

        if (existingReaction) {
            return res.status(400).json({ message: "You already reacted with this emoji" });
        }

        // Add reaction
        message.reactions.push({
            userId,
            emoji,
        });

        await message.save();
        await message.populate("reactions.userId", "fullName profilePic");

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in addGroupReaction:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Remove reaction from group message
export const removeGroupReaction = async (req, res) => {
    try {
        const { messageId, reactionId } = req.params;
        const userId = req.user._id;

        const message = await GroupMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Find and remove the reaction
        const reactionIndex = message.reactions.findIndex(
            (reaction) => reaction._id.toString() === reactionId && reaction.userId.toString() === userId.toString()
        );

        if (reactionIndex === -1) {
            return res.status(404).json({ message: "Reaction not found" });
        }

        message.reactions.splice(reactionIndex, 1);
        await message.save();

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in removeGroupReaction:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Search group messages
export const searchGroupMessages = async (req, res) => {
    try {
        const { query } = req.query;
        const { groupId } = req.params;
        const userId = req.user._id;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Check if user is member of the group
        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId,
        });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const messages = await GroupMessage.find({
            groupId,
            $text: { $search: query },
        })
            .populate("senderId", "fullName profilePic")
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in searchGroupMessages:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}; 