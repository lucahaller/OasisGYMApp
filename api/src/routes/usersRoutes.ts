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
  authorizeRole("USER"),
  userController.getProfile
);
router.put(
  "/update",
  authenticateToken,
  authorizeRole("USER"),
  userController.updateProfile
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.deleteUser)
);

export default router;
