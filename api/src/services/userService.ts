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
  password: string;
  age?: number;
  height?: number;
  weight?: number;
  injury?: string;
  notes?: string;
};

export const create = async (
  userData: NewUser
): Promise<ReturnType<typeof prisma.users.create>> => {
  return prisma.users.create({
    data: userData,
  });
};

// src/services/userService.ts
// export const getAll = async () => {
//   return await prisma.users.findMany({
//     where: {
//       role: { not: "ADMIN" }, // 👈 Excluir admin (si usás roles)
//     },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       age: true,
//       height: true,
//       weight: true,
//       notes: true,
//       injury: true,
//       created_at: true,
//       last_payment: true,
//       payment_amount: true,
//       payment_expiration: true,
//       // ❌ password no se incluye, así que no se devuelve
//     },
//   });
// };
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
