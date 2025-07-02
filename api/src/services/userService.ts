// src/services/user.service.ts
import { prisma } from "../prisma/client";

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
export const getAll = async () => {
  return await prisma.users.findMany({
    where: {
      role: { not: "ADMIN" }, // 👈 Excluir admin (si usás roles)
    },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      height: true,
      weight: true,
      notes: true,
      injury: true,
      created_at: true,
      last_payment: true,
      payment_amount: true,
      payment_expiration: true,
      // ❌ password no se incluye, así que no se devuelve
    },
  });
};
