import express from "express";
import { asyncHandler } from "../utils/asycHandler";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";
import {
  createRoutineBase,
  assignRoutineToUser,
  getAllRoutineBases,
  getUserRoutine,
  readRoutineExcel,
  evaluateUserRoutine,
  getUserRoutineExercises,
  getEvaluatedRoutineFile,
  getUserRoutineStatus,
  getLastEvaluatedRoutines,
} from "../controllers/routinesController";
import { upload } from "../middleware/uploadMiddleware";
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

router.post(
  "/upload-excel",
  authenticateToken,
  authorizeRole("ADMIN"), // o CLIENTE si es carga personalizada
  upload.single("file"),
  asyncHandler(readRoutineExcel)
);
router.get(
  "/user/:userId/exercises",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getUserRoutineExercises)
);

router.post(
  "/user/:userId/evaluate",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(evaluateUserRoutine)
);

router.get(
  "/user/:userId/evaluated-download",
  authenticateToken,
  authorizeRole("USER", "ADMIN"),
  asyncHandler(getEvaluatedRoutineFile)
);
router.get(
  "/user/:userId/status",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getUserRoutineStatus)
);

router.get(
  "/user/:userId/evaluated/all",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getLastEvaluatedRoutines)
);

export default router;
