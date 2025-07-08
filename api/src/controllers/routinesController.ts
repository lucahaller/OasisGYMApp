import { Request, Response } from "express";
import { prisma } from "../prisma/client";

// Tipos esperados para la creación y asignación
interface CreateRoutineBody {
  name: string;
  type: string;
  days: number;
  fileUrl: string;
  reusable?: boolean;
}

interface AssignRoutineBody {
  userId: number;
  routineBaseId?: number;
  customFile?: string;
}

// Crear rutina base (reutilizable)
export const createRoutineBase = async (
  req: Request<{}, {}, CreateRoutineBody>,
  res: Response
) => {
  try {
    const { name, type, days, fileUrl, reusable } = req.body;

    const routine = await prisma.routineBase.create({
      data: {
        name,
        type,
        days,
        fileUrl,
        reusable: reusable ?? true,
      },
    });

    res.status(201).json(routine);
  } catch (error) {
    console.error("Error al crear rutina base:", error);
    res.status(500).json({ message: "Error al crear rutina base" });
  }
};

// Asignar rutina a un usuario (puede ser base o personalizada)
export const assignRoutineToUser = async (
  req: Request<{}, {}, AssignRoutineBody>,
  res: Response
) => {
  try {
    const { userId, routineBaseId, customFile } = req.body;

    const assignment = await prisma.routineAssignment.create({
      data: {
        userId,
        routineBaseId: routineBaseId || null,
        customFile: customFile || null,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error al asignar rutina:", error);
    res.status(500).json({ message: "Error al asignar rutina" });
  }
};

// Obtener todas las rutinas base (admin)
export const getAllRoutineBases = async (_req: Request, res: Response) => {
  try {
    const routines = await prisma.routineBase.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(routines);
  } catch (error) {
    console.error("Error al obtener rutinas:", error);
    res.status(500).json({ message: "Error al obtener rutinas" });
  }
};

// Obtener rutina asignada a un usuario (cliente)
export const getUserRoutine = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  const { userId } = req.params;

  try {
    const routine = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      include: { routine: true },
    });

    if (!routine) {
      return res.status(404).json({ message: "No tiene rutina asignada" });
    }

    res.json(routine);
  } catch (error) {
    console.error("Error al obtener rutina del usuario:", error);
    res.status(500).json({ message: "Error al obtener rutina del usuario" });
  }
};
