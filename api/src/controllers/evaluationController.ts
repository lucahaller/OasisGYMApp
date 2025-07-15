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
      where: {
        evaluatedByAdmin: false, // 👈 filtrar si no querés mostrar autoevaluaciones de admin
      },
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

  if (!req.user) return res.status(401).json({ message: "No autenticado" });

  if (req.user.role === "USER" && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ message: "Acceso no autorizado" });
  }

  try {
    const evaluation = await prisma.evaluationRequest.findFirst({
      where: {
        userId: parseInt(userId),
        status: { in: ["pendiente", "aprobada"] },
        evaluatedByAdmin: false, // 👈 filtrar evaluaciones hechas por admin
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        data: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!evaluation) {
      return res.json({ id: null, data: [] });
    }

    const parsedData = Array.isArray(evaluation.data) ? evaluation.data : [];

    return res.json({
      id: evaluation.id,
      data: parsedData,
    });
  } catch (error) {
    console.error("Error al obtener evaluación:", error);
    res.status(500).json({ message: "Error al obtener evaluación" });
  }
};

// ✅ Guardar progreso de evaluación desde el ADMIN sin restricción de estado
export const saveAdminEvaluationProgress = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ message: "Datos inválidos" });
  }

  try {
    let evaluation = await prisma.evaluationRequest.findFirst({
      where: {
        userId: Number(userId),
        evaluatedByAdmin: true,
      },
    });

    if (evaluation) {
      evaluation = await prisma.evaluationRequest.update({
        where: { id: evaluation.id },
        data: { data, updatedAt: new Date() },
      });
    } else {
      evaluation = await prisma.evaluationRequest.create({
        data: {
          userId: Number(userId),
          status: "aprobada", // ya viene aprobado
          data,
          evaluatedByAdmin: true, // aquí marcamos el flag
        },
      });
    }

    return res.json({ message: "Progreso del admin guardado", evaluation });
  } catch (error) {
    console.error("Error al guardar progreso admin:", error);
    res.status(500).json({ message: "Error al guardar evaluación del admin" });
  }
};

export const getAdminEvaluationProgress = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  try {
    const evaluation = await prisma.evaluationRequest.findFirst({
      where: {
        userId: Number(userId),
        // ← Ahora filtramos por el flag que marcaste verdadero cuando guardas
        evaluatedByAdmin: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        data: true,
      },
    });

    if (!evaluation) {
      return res.json({ id: null, data: [] });
    }

    const parsedData = Array.isArray(evaluation.data) ? evaluation.data : [];
    return res.json({
      id: evaluation.id,
      data: parsedData,
    });
  } catch (error) {
    console.error("Error al obtener evaluación admin:", error);
    res.status(500).json({ message: "Error al obtener evaluación" });
  }
};
