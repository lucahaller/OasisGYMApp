import express from "express";
import { asyncHandler } from "../utils/asycHandler";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";
import {
  createRoutineBase,
  assignRoutineToUser,
  getAllRoutineBases,
  getUserRoutine,
} from "../controllers/routinesController";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(createRoutineBase)
);
router.post(
  "/assign",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(assignRoutineToUser)
);
router.get(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getAllRoutineBases)
);
router.get(
  "/user/:userId",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getUserRoutine)
);

export default router;
