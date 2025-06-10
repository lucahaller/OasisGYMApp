// src/routes/admin.routes.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";

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

export default router;
