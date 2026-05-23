import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken, getUnreadMessagesCount } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.get("/unread-count", protectRoute, getUnreadMessagesCount);

export default router;