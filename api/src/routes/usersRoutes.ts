// src/routes/user.routes.ts
import { Router } from "express";
import { asyncHandler } from "../utils/asycHandler";
import * as userController from "../controllers/usersController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";

const router = Router();

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
  userController.getProfile
);
router.put(
  "/update",
  authenticateToken,
  authorizeRole("USER"),
  userController.updateProfile
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  userController.getUserById
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
