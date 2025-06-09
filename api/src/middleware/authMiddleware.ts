// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token no proporcionado." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    // Guardamos los datos del usuario en req.user para usarlo más adelante
    (req as any).user = {
      id: decoded.id,
      role: decoded.role,
    };

    next(); // Sigue a la siguiente función
  } catch (err) {
    console.error("Error al verificar token:", err);
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};
