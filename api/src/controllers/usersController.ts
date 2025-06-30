import { NextFunction, Request, Response } from "express";
import * as userService from "../services/userService";
import { prisma } from "../prisma/client";

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAll(); // ✅ usa el service
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const {
    name,
    email,
    weight,
    height,
    age,
    injury,
    notes,
    last_payment,
    payment_expiration,
    payment_amount,
  } = req.body;

  try {
    const user = await prisma.users.create({
      data: {
        name,
        email: email ? email : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        age: age ? Number(age) : undefined,
        injury,
        notes,
        last_payment: last_payment ? new Date(last_payment) : undefined,
        payment_expiration: payment_expiration
          ? new Date(payment_expiration)
          : undefined,
        payment_amount: payment_amount ? Number(payment_amount) : undefined,
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({ where: { id: Number(id) } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    await prisma.users.delete({ where: { id: Number(id) } });
    return res.status(200).json({ message: "Usuario eliminado." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar el usuario", error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { age, height, weight, notes, injury } = req.body;

  try {
    const updatedUser = await prisma.users.update({
      where: { id: id },
      data: {
        age: age !== undefined ? Number(age) : undefined,
        height: height !== undefined ? Number(height) : undefined,
        weight: weight !== undefined ? Number(weight) : undefined,
        notes: notes !== undefined ? notes : undefined,
        injury: injury !== undefined ? injury : undefined,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({ message: "Error al actualizar perfil" });
  }
};

export const creditUserPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { months, amount } = req.body;

  if (!months || isNaN(months) || !amount || isNaN(amount)) {
    return res.status(400).json({ message: "Meses o monto inválidos" });
  }

  try {
    const lastPayment = new Date();
    const expiration = new Date(lastPayment);
    expiration.setMonth(expiration.getMonth() + Number(months));

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        last_payment: lastPayment,
        payment_expiration: expiration,
        payment_amount: parseFloat(amount),
        payment_status: "verde",
      },
    });

    // 👇 Agregar notificación por nuevo pago
    await prisma.notifications.create({
      data: {
        userId: updatedUser.id,
        message: `Nuevo pago acreditado para el usuario ${updatedUser.name}`,
      },
    });

    res.status(200).json({ message: "Pago acreditado correctamente" });
  } catch (error) {
    console.error("Error al acreditar pago:", error);
    res.status(500).json({ message: "Error al acreditar pago" });
  }
};
// src/controllers/usersController.ts

// src/controllers/usersController.ts

export const getAllNotifications = async (_req: Request, res: Response) => {
  console.log("🔔  Entered getAllNotifications");
  try {
    // Solo las NO leídas
    const notifications = await prisma.notifications.findMany({
      where: {
        read: false,
      },
      orderBy: { date: "desc" },
    });

    const users = await prisma.users.findMany({
      where: { id: { in: notifications.map((n) => n.userId) } },
      select: { id: true, name: true },
    });

    const userMap = new Map<number, string>(users.map((u) => [u.id, u.name]));

    const enriched = notifications.map((n) => ({
      id: n.id,
      message: n.message,
      date: n.date,
      read: n.read,
      user: {
        id: n.userId,
        name: userMap.get(n.userId) ?? "Usuario eliminado",
      },
    }));

    return res.json(enriched);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(
      "🔥 Error en getAllNotifications:",
      error.message,
      error.stack
    );
    return res.status(500).json({
      message: "Error al buscar las notificaciones",
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.notifications.update({
      where: { id: Number(id) },
      data: { read: true },
    });

    res.json({ message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    res.status(500).json({ message: "Error al actualizar notificación" });
  }
};

export const generatePaymentReminders = async (
  _req: Request,
  res: Response
) => {
  try {
    const users = await prisma.users.findMany();

    for (const user of users) {
      if (!user.payment_expiration) continue;

      const today = new Date();
      const diffTime = user.payment_expiration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let message = "";
      let type = "";
      let shouldCreateNotification = false;

      if (diffDays <= 0) {
        type = "pago_vencido";
        message = `El pago del usuario ${user.name} ha vencido.`;
        shouldCreateNotification = true;
      } else if (diffDays <= 5) {
        type = `pago_${diffDays}_dias`;
        message = `El pago del usuario ${user.name} vence en ${diffDays} días.`;
        shouldCreateNotification = true;
      } else if (diffDays <= 14) {
        type = "pago_proximo";
        message = `El pago del usuario ${user.name} vence pronto.`;
        shouldCreateNotification = true;
      }

      if (shouldCreateNotification) {
        const existing = await prisma.notifications.findFirst({
          where: {
            userId: user.id,
            type: "vencimiento",
            read: false,
          },
        });

        if (!existing) {
          await prisma.notifications.create({
            data: {
              type,
              message,
              userId: user.id,
            },
          });
        }
      }
    }

    res.json({ message: "Recordatorios generados correctamente" });
  } catch (error) {
    console.error("Error generando recordatorios:", error);
    res.status(500).json({ message: "Error generando recordatorios" });
  }
};
