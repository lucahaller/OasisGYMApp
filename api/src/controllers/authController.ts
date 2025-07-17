import { Request, Response } from "express";
const bcrypt = require("bcrypt"); // o usa import bcrypt from 'bcrypt' si estás con ESM
import { PrismaClient } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";

const prisma = new PrismaClient();
interface RegisterBody {
  name: string;
  email: string;
  password: string;
  age?: number;
  height?: number;
  weight?: number;
  injury?: string;
  notes?: string;
}

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
) => {
  try {
    const { name, email, password, age, height, weight, injury, notes } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        field: "general",
        message: "Nombre, email y contraseña son obligatorios.",
      });
    }

    // Verificar email existente
    const existingEmail = await prisma.users.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        field: "email",
        message: "El correo ya está registrado.",
      });
    }

    // Verificar nombre existente
    const existingName = await prisma.users.findFirst({ where: { name } });
    if (existingName) {
      return res.status(400).json({
        field: "name",
        message: "El nombre de usuario ya existe.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalize = (val: any) => (val === "" ? null : val);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        created_at: new Date(),
        role: "USER",
        age: normalize(age),
        height: normalize(height),
        weight: normalize(weight),
        injury: normalize(injury),
        notes: normalize(notes),
      },
    });

    return res.status(201).json({
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
    return res.status(500).json({
      field: "general",
      message: "Error interno del servidor.",
    });
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

  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  // Comparar contraseña primero para evitar fugas de info
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  // Si es admin, lo dejamos pasar sin validar pagos
  if (user.role === "ADMIN") {
    const token = jwt.sign({ id: user.id, role: user.role }, secret as Secret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });

    return res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  }

  // Validaciones de pago SOLO para usuarios normales
  if (user.payment_status === "rojo") {
    return res
      .status(403)
      .json({ message: "Tu cuenta tiene el pago vencido." });
  }

  if (!user.last_payment) {
    return res.status(403).json({
      message:
        "Aún no has realizado un pago. Contactá al gimnasio para habilitar tu cuenta.",
    });
  }

  if (user.payment_expiration && new Date() > user.payment_expiration) {
    return res
      .status(403)
      .json({ message: "Cuenta inactiva por falta de pago" });
  }

  // Si pasa todas las validaciones, generar token
  const token = jwt.sign({ id: user.id, role: user.role }, secret as Secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });

  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
};
