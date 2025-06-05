// src/services/user.service.ts
import { prisma } from "../prisma/client";

type NewUser = {
  name: string;
  email: string;
  password: string;
};

export const getAll = async (): Promise<
  ReturnType<typeof prisma.users.findMany>
> => {
  return prisma.users.findMany();
};

export const create = async (
  userData: NewUser
): Promise<ReturnType<typeof prisma.users.create>> => {
  return prisma.users.create({
    data: userData,
  });
};
