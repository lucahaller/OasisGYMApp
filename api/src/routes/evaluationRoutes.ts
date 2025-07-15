import express from "express";
import { asyncHandler } from "../utils/asycHandler";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";
import {
  approveEvaluationRequest,
  createEvaluationRequest,
  getActiveEvaluation,
  getAdminEvaluationProgress,
  getAllEvaluationRequests,
  getUserEvaluationRequests,
  saveAdminEvaluationProgress,
  saveEvaluationProgress,
} from "../controllers/evaluationController";
const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN", "USER"),
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
router.get(
  "/user/:userId/active", // ✅ primero
  authenticateToken,
  authorizeRole("USER", "ADMIN"),
  asyncHandler(getActiveEvaluation)
);
router.get(
  "/user/:userId/admin",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(getAdminEvaluationProgress)
);
router.patch(
  "/:id/save",
  authenticateToken,
  authorizeRole("USER", "ADMIN"),
  asyncHandler(saveEvaluationProgress)
);
router.patch(
  "/:id/approve",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(approveEvaluationRequest)
);

router.patch(
  "/user/:userId/saveadmin",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(saveAdminEvaluationProgress)
);

export default router;
