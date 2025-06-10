// src/routes/admin.routes.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";
import { asyncHandler } from "../utils/asycHandler";
import * as userController from "../controllers/usersController";
const router = Router();

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole("ADMIN"),
  (req, res) => {
    res.json({
      message: "Bienvenido al panel de administrador",
      user: (req as any).user,
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
