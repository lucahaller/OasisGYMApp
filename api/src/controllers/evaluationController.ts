import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// import "./types/express";
const prisma = new PrismaClient();

// 1. Crear solicitud de evaluación
export const createEvaluationRequest = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const existing = await prisma.evaluationRequest.findFirst({
      where: {
        userId: user.id,
        status: { in: ["pendiente", "aprobada"] },
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Ya tienes una solicitud activa." });
    }

    const request = await prisma.evaluationRequest.create({
      data: {
        userId: user.id,
        status: "pendiente",
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// 2. Obtener solicitudes del usuario
export const getUserEvaluationRequests = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.role === "USER" && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ message: "Acceso no autorizado" });
  }

  const requests = await prisma.evaluationRequest.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: "desc" },
  });

  res.json(requests);
};

// 3. Guardar progreso de evaluación (peso y reps)
export const saveEvaluationProgress = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data } = req.body; // [{ ejercicio, peso, reps }]

  try {
    const request = await prisma.evaluationRequest.update({
      where: { id: Number(id) },
      data: {
        data,
        updatedAt: new Date(),
      },
    });

    res.json({ message: "Progreso guardado", request });
  } catch (error) {
    console.error("Error al guardar progreso:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// 4. Aprobar solicitud de evaluación (ADMIN)
export const approveEvaluationRequest = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const request = await prisma.evaluationRequest.update({
      where: { id: Number(id) },
      data: {
        status: "aprobada",
        updatedAt: new Date(),
      },
    });

    res.json({ message: "Solicitud aprobada", request });
  } catch (error) {
    console.error("Error al aprobar solicitud:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

export const getAllEvaluationRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.evaluationRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(requests);
  } catch (error) {
    console.error(
      "Error al obtener todas las solicitudes de evaluación:",
      error
    );
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getActiveEvaluation = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.role === "USER" && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ message: "Acceso no autorizado" });
  }

  try {
    const evaluation = await prisma.evaluationRequest.findFirst({
      where: {
        userId: parseInt(userId),
        status: { in: ["pendiente", "aprobada"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!evaluation) {
      return res.json({ ejercicios: [] }); // No hay evaluación activa
    }

    res.json(evaluation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener evaluación" });
  }
};
