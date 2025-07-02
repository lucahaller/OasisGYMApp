import { prisma } from "../prisma/client";

export default async function generatePaymentRemindersUtil() {
  const users = await prisma.users.findMany();

  const today = new Date();
  for (const u of users) {
    const exp = u.payment_expiration;
    const diffDays = exp
      ? Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // 1) Determinar nuevo payment_status
    let newStatus: "verde" | "amarillo" | "rojo";
    if (!exp || diffDays! < 0) newStatus = "rojo";
    else if (diffDays! <= 5) newStatus = "amarillo";
    else newStatus = "verde";

    // 2) Actualizar si cambió
    if (u.payment_status !== newStatus) {
      await prisma.users.update({
        where: { id: u.id },
        data: { payment_status: newStatus },
      });
    }

    // 3) Decidir mensaje y tipo
    let type: string | null = null;
    let message: string | null = null;
    if (diffDays! < 0) {
      type = "pago_vencido";
      message = `El pago de ${u.name} ha vencido.`;
    } else if (diffDays! <= 5 && diffDays! >= 1) {
      type = `pago_${diffDays}_dias`;
      message = `El pago de ${u.name} vence en ${diffDays} día(s).`;
    } else if (diffDays! <= 14) {
      type = "pago_proximo";
      message = `El pago de ${u.name} vence pronto.`;
    }

    // 4) Crear notificación si aplica y no existe
    if (type && message) {
      const exists = await prisma.notifications.findFirst({
        where: { userId: u.id, type, read: false },
      });
      if (!exists) {
        await prisma.notifications.create({
          data: { userId: u.id, type, message },
        });
      }
    }
  }
}
