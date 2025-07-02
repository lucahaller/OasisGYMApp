// src/routes/user.routes.ts
import { Router } from "express";
import { asyncHandler } from "../utils/asycHandler";
import * as userController from "../controllers/usersController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";

const router = Router();

router.get(
  "/notifications",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.getAllNotifications)
);

router.post(
  "/notifications",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.generatePaymentReminders)
);
router.patch(
  "/notifications/:id/read",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.markNotificationAsRead)
);

router.get(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  userController.getAllUsers
);
router.post("/", userController.createUser);
router.get(
  "/profile",
  authenticateToken,
  authorizeRole("USER", "ADMIN"),
  asyncHandler(userController.getProfile)
);
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.updateProfile)
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.getUserById)
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.deleteUser)
);

router.put(
  "/pay/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.creditUserPayment)
);
export default router;
