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
  const { ejercicios } = req.body; // [{ ejercicio, peso, reps }, ...]

  try {
    // 1) Obtener asignación
    const assignment = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      include: { routine: true },
    });
    if (!assignment)
      return res.status(404).json({ message: "No tiene rutina" });

    // 2) Ruta del archivo
    const fileUrl = assignment.customFile || assignment.routine!.fileUrl;
    const filePath = path.resolve(
      process.cwd(),
      fileUrl.replace(/^\/public\//, "public/")
    );
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "Archivo no encontrado" });

    // 3) Leer workbook y hoja 3
    const wb = xlsx.readFile(filePath);
    const sheetName = wb.SheetNames[2];
    const sh = wb.Sheets[sheetName];

    // 4) Leer ejercicios de la hoja (como antes)
    const rows: any[][] = xlsx.utils.sheet_to_json(sh, {
      header: 1,
      defval: "",
    });

    // 5) Preparar columna de RM para escribir con sheet_add_aoa
    //    Empezamos en fila 7 (índice 6). origin 'C7'.
    const rmCol: (number | string)[][] = [];
    for (let i = 6; i < rows.length; i++) {
      const nombre: string = (rows[i][1] || "").toString().trim().toLowerCase();
      // ignorar títulos
      if (!nombre || nombre === "ejercicio" || nombre === "grupo") {
        rmCol.push([""]);
        continue;
      }
      const encontrado = ejercicios.find(
        (e: any) => e.ejercicio.toLowerCase().trim() === nombre
      );
      if (encontrado) {
        rmCol.push([calculateRM(encontrado.peso, encontrado.reps)]);
      } else {
        rmCol.push([""]);
      }
    }

    // 6) Escribir solo la columna C sin tocar lo demás
    xlsx.utils.sheet_add_aoa(sh, rmCol, { origin: "C7" });

    // 7) Guardar archivo evaluado
    const evalName = `${userId}-${Date.now()}-evaluated.xlsx`;
    const saveDir = path.resolve(process.cwd(), "uploads/routines/evaluations");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    const savePath = path.join(saveDir, evalName);
    xlsx.writeFile(wb, savePath);

    // 8) Actualizar db y limpiar viejas
    await prisma.routineAssignment.update({
      where: { id: assignment.id },
      data: { customFile: `evaluations/${evalName}`, evaluated: true },
    });
    const old = await prisma.routineAssignment.findMany({
      where: {
        userId: Number(userId),
        evaluated: true,
        id: { not: assignment.id },
      },
      orderBy: { updatedAt: "desc" },
      skip: 2,
    });
    for (const o of old) {
      const p = path.join(process.cwd(), "uploads/routines", o.customFile!);
      if (fs.existsSync(p)) fs.unlinkSync(p);
      await prisma.routineAssignment.delete({ where: { id: o.id } });
    }

    return res.json({
      message: "Evaluación guardada",
      evaluatedFile: `evaluations/${evalName}`,
    });
  } catch (err) {
    console.error(err);
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

export const getUserRoutineStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const assignment = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    if (!assignment) return res.json({ status: "no-assigned" });

    if (assignment.evaluated) return res.json({ status: "evaluated" });

    return res.json({ status: "assigned" });
  } catch (error) {
    console.error("Error al obtener estado de rutina:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const getLastEvaluatedRoutines = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const assignments = await prisma.routineAssignment.findMany({
      where: {
        userId: Number(userId),
        evaluated: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 2,
      include: { routine: true },
    });

    res.json(assignments);
  } catch (error) {
    console.error("Error al obtener rutinas evaluadas:", error);
    res.status(500).json({ message: "Error al obtener rutinas evaluadas" });
  }
};
