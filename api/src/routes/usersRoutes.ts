// src/routes/user.routes.ts
import { Router } from "express";
import * as userController from "../controllers/usersController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";
import { asyncHandler } from "../utils/asycHandler";
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
  async (req, res) => {
    const user = (req as any).user;
    res.json({
      message: "Perfil del usuario logueado",
      user,
    });
  }
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  asyncHandler(userController.deleteUser)
);
export default router;
