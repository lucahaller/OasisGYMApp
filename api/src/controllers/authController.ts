import { Request, Response } from "express";
const bcrypt = require("bcrypt"); // o usa import bcrypt from 'bcrypt' si estás con ESM
import { PrismaClient } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";

const prisma = new PrismaClient();
interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nombre, email y contraseña son obligatorios." });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        created_at: new Date(),
        role: "USER", // valor por defecto
      },
    });

    res.status(201).json({
      message: "Usuario registrado correctamente.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret || !expiresIn) {
    return res.status(500).json({ message: "Server misconfigured" });
  }

  const user = await prisma.users.findUnique({ where: { email } });
  if (user?.payment_expiration && new Date() > user.payment_expiration) {
    return res
      .status(403)
      .json({ message: "Cuenta inactiva por falta de pago" });
  }
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: "Credenciales inválidas" });

  const token = jwt.sign({ id: user.id, role: user.role }, secret as Secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });

  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
};
