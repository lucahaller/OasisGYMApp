// src/services/user.service.ts
import { prisma } from "../prisma/client";
function getPaymentStatus(
  paymentExpiration: Date | null
): "verde" | "amarillo" | "rojo" {
  if (!paymentExpiration) return "rojo";
  const now = new Date();
  const diff = Math.ceil(
    (paymentExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff > 7) return "verde";
  if (diff >= 1) return "amarillo";
  return "rojo";
}

type NewUser = {
  name: string;
  email: string;
  weight?: number;
  height?: number;
  age?: number;
  injury?: string;
  notes?: string;
  last_payment?: Date;
  payment_expiration?: Date;
  payment_amount?: number;
};

export const create = async (
  userData: NewUser
): Promise<ReturnType<typeof prisma.users.create>> => {
  return prisma.users.create({
    data: userData,
  });
};

// src/services/userService.ts
export const getAll = async () => {
  const users = await prisma.users.findMany({
    where: {
      role: { not: "ADMIN" },
    },
    include: { notifications: true },
  });

  const updated = await Promise.all(
    users.map(async (user) => {
      const newStatus = getPaymentStatus(user.payment_expiration);
      if (user.payment_status !== newStatus) {
        await prisma.users.update({
          where: { id: user.id },
          data: { payment_status: newStatus },
        });
      }
      return { ...user, payment_status: newStatus };
    })
  );

  return updated;
};
