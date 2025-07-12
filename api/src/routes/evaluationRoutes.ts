import express from "express";
import { asyncHandler } from "../utils/asycHandler";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";
import {
  approveEvaluationRequest,
  createEvaluationRequest,
  getAllEvaluationRequests,
  getUserEvaluationRequests,
  saveEvaluationProgress,
} from "../controllers/evaluationController";
const router = express.Router();

router.post(
  "/",
  authenticateToken,

  asyncHandler(createEvaluationRequest)
);

router.get(
  "/user/all", // ✅ primero
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getAllEvaluationRequests)
);

router.get(
  "/user/:userId", // ⬅ después
  authenticateToken,
  authorizeRole("ADMIN", "USER"),
  asyncHandler(getUserEvaluationRequests)
);

router.patch(
  "/:id/save",
  authenticateToken,
  authorizeRole("USER"),
  asyncHandler(saveEvaluationProgress)
);
router.patch(
  "/:id/approve",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(approveEvaluationRequest)
);

export default router;
