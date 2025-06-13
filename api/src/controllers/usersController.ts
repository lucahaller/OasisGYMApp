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

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { age, height, weight } = req.body;

  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({ message: "Error al actualizar perfil" });
  }
};
