import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createGroup,
    getUserGroups,
    getGroupDetails,
    addMemberToGroup,
    removeMemberFromGroup,
    getGroupMessages,
    sendGroupMessage,
    addGroupReaction,
    removeGroupReaction,
    searchGroupMessages,
} from "../controllers/group.controller.js";

const router = express.Router();

// Group management routes
router.post("/create", protectRoute, createGroup);
router.get("/user-groups", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.post("/:groupId/add-member", protectRoute, addMemberToGroup);
router.delete("/:groupId/remove-member/:memberId", protectRoute, removeMemberFromGroup);

// Group messaging routes
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/send-message", protectRoute, sendGroupMessage);

// Group message reaction routes
router.post("/messages/:messageId/reactions", protectRoute, addGroupReaction);
router.delete("/messages/:messageId/reactions/:reactionId", protectRoute, removeGroupReaction);

// Group message search routes
router.get("/:groupId/search", protectRoute, searchGroupMessages);

export default router; 