import { Router } from "express";
import { asyncHandler } from "../utils/asycHandler";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/authMiddlewareRole";
import generatePaymentRemindersUtil from "../utils/generatePaymentReminders";
import { prisma } from "../prisma/client";

const router = Router();

router.get(
  "/mynotifications",
  authenticateToken,
  authorizeRole("USER"),
  async (req, res) => {
    const userId = req.user.id; // del token
    try {
      // opcional: llamar a generatePaymentReminders antes de buscar para asegurar que estén actualizadas
      await generatePaymentRemindersUtil();

      const notifications = await prisma.notifications.findMany({
        where: { userId, read: false },
        orderBy: { date: "desc" },
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener notificaciones" });
    }
  }
);

router.patch(
  "/mynotifications/:id/read",
  authenticateToken,
  authorizeRole("USER"),
  async (req, res) => {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);

    try {
      const notification = await prisma.notifications.findUnique({
        where: { id: notificationId },
      });
      if (!notification || notification.userId !== userId) {
        return res.status(403).json({ error: "No autorizado" });
      }

      await prisma.notifications.update({
        where: { id: notificationId },
        data: { read: true },
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al marcar como leída" });
    }
  }
);

export default router;
