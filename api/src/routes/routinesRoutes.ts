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
  selfEvaluateRoutine,
  getSelfEvaluatedStatus,
  uploadRoutineExcel,
  downloadEvaluatedRoutineById,
} from "../controllers/routinesController";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// ==========================
// 📦 ADMIN - CRUD BASES
// ==========================
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

// ==========================
// 📄 EXCEL FILE HANDLING
// ==========================
router.post(
  "/uploadexcel",
  authenticateToken,
  authorizeRole("ADMIN"),
  upload.single("file"),
  asyncHandler(uploadRoutineExcel)
);

// ==========================
// ✅ EVALUACIONES
// ==========================

// Evaluación por parte del ADMIN o USER (usa el Excel y genera archivo final)
router.post(
  "/user/:userId/evaluate",
  authenticateToken,
  authorizeRole("ADMIN", "USER"),
  asyncHandler(evaluateUserRoutine)
);

// Autoevaluación (self)
router.post(
  "/user/:userId/evaluate/self",
  authenticateToken,
  authorizeRole("USER"),
  asyncHandler(selfEvaluateRoutine)
);

// ==========================
// 📥 DESCARGAS Y STATUS
// ==========================

router.get(
  "/user/:userId/evaluated-download",
  authenticateToken,
  authorizeRole("USER", "ADMIN"),
  asyncHandler(getEvaluatedRoutineFile)
);

router.get(
  "/user/:userId/evaluated-download/:assignmentId",
  authenticateToken,
  authorizeRole("USER", "ADMIN"),
  asyncHandler(downloadEvaluatedRoutineById)
);

router.get(
  "/user/:userId/evaluated/all",
  authenticateToken,
  authorizeRole("ADMIN", "USER"),
  asyncHandler(getLastEvaluatedRoutines)
);

router.get(
  "/user/:userId/status",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getUserRoutineStatus)
);

router.get(
  "/user/:userId/selfevaluated",
  authenticateToken,
  authorizeRole("USER"),
  asyncHandler(getSelfEvaluatedStatus)
);

// ==========================
// 🏋️‍♂️ USUARIO
// ==========================

// Ejercicios de la rutina (sección principal de evaluación)
router.get(
  "/user/:userId/exercises",
  authenticateToken,
  authorizeRole("ADMIN", "USER"),
  asyncHandler(getUserRoutineExercises)
);

// Información general de la rutina asignada
router.get(
  "/user/:userId",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getUserRoutine)
);

export default router;
