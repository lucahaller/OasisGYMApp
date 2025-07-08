import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

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

export const readRoutineExcel = async (req: Request, res: Response) => {
  try {
    const filePath = req.file.path;

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // Filtramos posibles columnas útiles
    const ejercicios = jsonData
      .map((row) => ({
        ejercicio: row.Ejercicio || row.EJERCICIO || row.Nombre || "",
        series: row.Series || row.SERIES || "",
        reps: row.Repeticiones || row.REPS || row.Repet || "",
      }))
      .filter((ej) => ej.ejercicio); // solo si tiene nombre de ejercicio

    res.json({ ejercicios });
  } catch (error) {
    console.error("Error al leer el Excel:", error);
    res.status(500).json({ message: "Error al leer la planilla" });
  }
};

export const getUserRoutineExercises = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // Buscamos la asignación más reciente del usuario
    const assignment = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      include: { routine: true },
    });

    if (!assignment) {
      return res.status(404).json({ message: "No tiene rutina asignada" });
    }

    // Obtenemos la ruta del archivo
    const fileRelativePath =
      assignment.customFile || assignment.routine?.fileUrl;
    if (!fileRelativePath) {
      return res
        .status(404)
        .json({ message: "Archivo de rutina no encontrado" });
    }

    // Ajustar ruta absoluta según estructura tu proyecto
    const filePath = path.join(
      process.cwd(),
      fileRelativePath.replace(/^\/public\//, "public/")
    );

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Archivo de rutina no existe en disco" });
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[2]]; // Hoja 3
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    const exercises = [];
    for (let i = 6; i < jsonData.length; i++) {
      const nombreEjercicio = jsonData[i][1]; // Columna B, fila i+1 (índice 1)
      if (nombreEjercicio) {
        exercises.push({ name: nombreEjercicio });
      }
    }

    return res.json(exercises);
  } catch (error) {
    console.error("Error en getUserRoutineExercises:", error);
    return res.status(500).json({ message: "Error al obtener ejercicios" });
  }
};

const percentageTable: Record<number, number> = {
  1: 100,
  2: 95,
  3: 90,
  4: 85,
  5: 80,
  6: 78,
  7: 77,
  8: 75,
  9: 72,
  10: 70,
};

const calculateRM = (peso: number, reps: number) => {
  const porcentaje = percentageTable[reps] || 69;
  return Math.round((peso * 100) / porcentaje);
};

export const evaluateUserRoutine = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { ejercicios } = req.body;

  try {
    const assignment = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      include: { routine: true },
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "No se encontró rutina asignada" });
    }

    const baseFilePath = assignment.customFile
      ? path.resolve(process.cwd(), "uploads/routines", assignment.customFile)
      : assignment.routine?.fileUrl
      ? path.resolve(
          process.cwd(),
          assignment.routine.fileUrl.replace(/^\/?public\//, "public/")
        )
      : null;

    console.log("Ruta a archivo:", baseFilePath);

    if (!baseFilePath || !fs.existsSync(baseFilePath)) {
      return res
        .status(404)
        .json({ message: "Archivo de rutina no encontrado" });
    }

    const workbook = xlsx.readFile(baseFilePath);
    const sheetName = workbook.SheetNames[2];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    for (let i = 6; i < rows.length; i++) {
      const nombreEjercicio = rows[i][1];
      if (!nombreEjercicio) continue;

      const evaluado = ejercicios.find(
        (e: any) => e.ejercicio === nombreEjercicio
      );
      if (evaluado) {
        const rmCalculado = calculateRM(evaluado.peso, evaluado.reps);
        rows[i][2] = rmCalculado;
      }
    }

    const newSheet = xlsx.utils.aoa_to_sheet(rows);
    workbook.Sheets[sheetName] = newSheet;

    const evaluatedFileName = `${userId}-${Date.now()}-evaluated.xlsx`;
    const savePath = path.resolve(
      process.cwd(),
      "uploads/routines/evaluations",
      evaluatedFileName
    );

    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }

    xlsx.writeFile(workbook, savePath);

    await prisma.routineAssignment.update({
      where: { id: assignment.id },
      data: {
        customFile: `evaluations/${evaluatedFileName}`,
        evaluated: true,
        updatedAt: new Date(),
      },
    });

    res.json({
      message: "Evaluación guardada correctamente",
      evaluatedFile: `evaluations/${evaluatedFileName}`,
    });
  } catch (error) {
    console.error("Error al evaluar rutina:", error);
    res.status(500).json({ message: "Error al evaluar rutina" });
  }
};

export const getEvaluatedRoutineFile = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const assignment = await prisma.routineAssignment.findFirst({
      where: {
        userId: Number(userId),
        evaluated: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!assignment || !assignment.customFile) {
      return res.status(404).json({ message: "No hay rutina evaluada" });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads/routines",
      assignment.customFile
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    res.download(filePath); // fuerza descarga
  } catch (error) {
    console.error("Error al obtener archivo evaluado:", error);
    res.status(500).json({ message: "Error al obtener archivo evaluado" });
  }
};
