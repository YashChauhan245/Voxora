import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  conversationStarters,
  grammarHelper,
  translateWithTone,
  voiceFeedback,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/translate", translateWithTone);
router.post("/grammar", grammarHelper);
router.post("/starters", conversationStarters);
router.post("/voice-feedback", voiceFeedback);

export default router;
