import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getProgressDashboard, logProgressEvent } from "../controllers/progress.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/events", logProgressEvent);
router.get("/dashboard", getProgressDashboard);

export default router;
