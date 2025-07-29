import express from "express";
import { getPreview } from "../controllers/linkPreview.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/preview", protectRoute, getPreview);

export default router; 