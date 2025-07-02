import { prisma } from "../prisma/client";

// utils/generatePaymentReminders.ts
export const generateExpiringPaymentNotifications = async () => {
  const today = new Date();

  const soonExpiringUsers = await prisma.users.findMany({
    where: {
      payment_expiration: {
        gte: today,
        lte: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
    },
  });

  for (const user of soonExpiringUsers) {
    if (!user.payment_expiration) continue; // 👈 Previene error si es null

    const daysLeft = Math.ceil(
      (user.payment_expiration.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Evita notificaciones duplicadas
    const existing = await prisma.notifications.findFirst({
      where: {
        userId: user.id,
        message: {
          contains: `vencer en ${daysLeft} día`,
        },
      },
    });

    if (!existing) {
      await prisma.notifications.create({
        data: {
          userId: user.id,
          message: `La cuota de ${user.name} vencerá en ${daysLeft} día(s)`,
        },
      });
    }
  }
};
