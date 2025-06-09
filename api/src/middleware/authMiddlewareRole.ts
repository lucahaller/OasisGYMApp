// middlewares/authorizeRole.ts
import { Request, Response, NextFunction } from "express";

export const authorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      res
        .status(403)
        .json({ message: "No tienes permisos para acceder a esta ruta." });
      return;
    }

    next();
  };
};
