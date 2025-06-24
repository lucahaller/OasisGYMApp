import { NextFunction, Request, Response } from "express";
import * as userService from "../services/userService";
import { prisma } from "../prisma/client";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAll();
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const newUser = await userService.create({ name, email, password });
  res.status(201).json(newUser);
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
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword });
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
  const userId = (req as any).user.id;
  const { age, height, weight, notes, injury } = req.body;

  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        age: age !== undefined ? Number(age) : undefined,
        height: height !== undefined ? Number(height) : undefined,
        weight: weight !== undefined ? Number(weight) : undefined,
        notes: notes !== undefined ? notes : undefined,
        injury: injury !== undefined ? injury : undefined,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    res.status(200).json({ user: userWithoutPassword });
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

    await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        last_payment: lastPayment,
        payment_expiration: expiration,
        payment_amount: parseFloat(amount),
      },
    });

    res.status(200).json({ message: "Pago acreditado correctamente" });
  } catch (error) {
    console.error("Error al acreditar pago:", error);
    res.status(500).json({ message: "Error al acreditar pago" });
  }
};
