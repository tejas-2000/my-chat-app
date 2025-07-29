import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, addReaction, removeReaction, searchMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

// Reaction routes
router.post("/:messageId/reactions", protectRoute, addReaction);
router.delete("/:messageId/reactions/:reactionId", protectRoute, removeReaction);

// Search routes
router.get("/search/:id", protectRoute, searchMessages);

export default router;
