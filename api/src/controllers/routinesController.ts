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

export const uploadRoutineExcel = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file)
      return res.status(400).json({ message: "No se subió ningún archivo" });

    const filename = `${Date.now()}-${file.originalname}`;
    const finalPath = path.resolve("public/routines", filename);
    fs.renameSync(file.path, finalPath);

    let routine = null;

    if (req.body.saveToDB === "true") {
      routine = await prisma.routineBase.create({
        data: {
          name: file.originalname.replace(".xlsx", ""),
          type: "personalizada",
          days: 3,
          fileUrl: `/public/routines/${filename}`,
          reusable: true,
        },
      });
    }

    res.json({
      message: "Archivo subido correctamente",
      routine, // null si no se guardó en DB
      fileUrl: `/public/routines/${filename}`,
    });
  } catch (error) {
    console.error("❌ Error al subir rutina:", error);
    res.status(500).json({ message: "Error al subir la rutina" });
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

    // Obtenemos la ruta del archivo: si hay customFile, se asume que es evaluado y
    // se encuentra en "uploads/routines", sino se usa la fileUrl de la rutina base.
    let filePath = "";
    if (assignment.customFile) {
      filePath = path.join(
        process.cwd(),
        "uploads/routines",
        assignment.customFile
      );
    } else if (assignment.routine?.fileUrl) {
      filePath = path.join(
        process.cwd(),
        assignment.routine.fileUrl.replace(/^\/public\//, "public/")
      );
    } else {
      return res
        .status(404)
        .json({ message: "Archivo de rutina no encontrado" });
    }

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
      const nombreEjercicio = jsonData[i][1]; // Columna B
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
  const { ejercicios, nombre, edad } = req.body;

  try {
    // 1) Busca la asignación BASE más reciente (no evaluada)
    const lastBase = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId), evaluated: false },
      orderBy: { createdAt: "desc" },
      include: { routine: true },
    });
    if (!lastBase) {
      return res.status(404).json({ message: "No tiene rutina base asignada" });
    }

    // 2) Carga el archivo de Excel
    const filePath = lastBase.customFile
      ? path.join(process.cwd(), "uploads", "routines", lastBase.customFile)
      : path.join(
          process.cwd(),
          lastBase.routine!.fileUrl.replace(/^\/public\//, "public/")
        );
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Archivo de rutina no encontrado" });
    }
    const wb = xlsx.readFile(filePath);
    const sh = wb.Sheets[wb.SheetNames[2]]; // Hoja 3

    // 3) Calcula y vuela los RM en columna C empezando en fila 7
    const rows: any[][] = xlsx.utils.sheet_to_json(sh, {
      header: 1,
      defval: "",
    });
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
      const pct = percentageTable[reps] || 69;
      return Math.round((peso * 100) / pct);
    };

    const rmCol: (number | string)[][] = [];
    for (let i = 6; i < rows.length; i++) {
      const nombreEj = (rows[i][1] || "").toString().trim().toLowerCase();
      if (!nombreEj || ["ejercicio", "grupo"].includes(nombreEj)) {
        rmCol.push([""]);
        continue;
      }
      const match = ejercicios.find(
        (e: any) => e.ejercicio.toLowerCase().trim() === nombreEj
      );
      rmCol.push(match ? [calculateRM(match.peso, match.reps)] : [""]);
    }
    xlsx.utils.sheet_add_aoa(sh, rmCol, { origin: "C7" });

    // 4) Inserta nombre, fecha y edad en las celdas B1, B2, B3
    if (nombre) sh["B1"] = { t: "s", v: nombre };
    sh["B2"] = { t: "s", v: new Date().toLocaleDateString("es-AR") };
    if (edad) sh["B3"] = { t: "n", v: Number(edad) };

    // 5) Guarda el nuevo archivo evaluado
    const evalName = `${userId}-${Date.now()}-admin-evaluated.xlsx`;
    const saveDir = path.resolve(process.cwd(), "uploads/routines/evaluations");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    const savePath = path.join(saveDir, evalName);
    xlsx.writeFile(wb, savePath);

    // 6) Crea un nuevo registro de routineAssignment para la evaluación del admin
    const adminAssignment = await prisma.routineAssignment.create({
      data: {
        userId: Number(userId),
        routineBaseId: lastBase.routineBaseId,
        customFile: `evaluations/${evalName}`,
        evaluated: true,
        selfEvaluated: false,
      },
    });

    // 7) Elimina las solicitudes aprobadas ya consumidas
    await prisma.evaluationRequest.deleteMany({
      where: {
        userId: Number(userId),
        status: "aprobada",
        evaluatedByAdmin: false,
      },
    });

    // 8) Limpia evaluaciones antiguas dejando solo las 2 más recientes
    const toDelete = await prisma.routineAssignment.findMany({
      where: {
        userId: Number(userId),
        evaluated: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: 2,
    });
    for (const old of toDelete) {
      if (old.customFile) {
        const oldPath = path.join(
          process.cwd(),
          "uploads/routines",
          old.customFile
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      await prisma.routineAssignment.delete({ where: { id: old.id } });
    }

    return res.json({
      message: "Evaluación del admin guardada",
      evaluatedFile: `evaluations/${evalName}`,
      adminAssignment,
    });
  } catch (err) {
    console.error("Error al evaluar rutina por admin:", err);
    res.status(500).json({ message: "Error al evaluar rutina por admin" });
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

// Autoevaluación (self)
export const selfEvaluateRoutine = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { ejercicios, nombre, edad } = req.body;

  try {
    // 0) Buscamos la solicitud aprobada pendiente de autoevaluación
    const approvedRequest = await prisma.evaluationRequest.findFirst({
      where: {
        userId: Number(userId),
        status: "aprobada",
        evaluatedByAdmin: false,
      },
      orderBy: { createdAt: "desc" },
    });
    if (!approvedRequest) {
      return res.status(400).json({
        message:
          "No tienes ninguna evaluación aprobada. Solicita una evaluación y espera la aprobación del admin.",
      });
    }

    // 1) Recuperamos la última rutina evaluada por admin
    const lastAdminEval = await prisma.routineAssignment.findFirst({
      where: {
        userId: Number(userId),
        evaluated: true,
        selfEvaluated: false,
      },
      orderBy: { createdAt: "desc" },
      include: { routine: true },
    });
    if (!lastAdminEval) {
      return res.status(404).json({
        message: "No se encontró rutina evaluada por admin para autoevaluar.",
      });
    }

    // 2) Determinamos la ruta al archivo Excel
    const fileUrl = lastAdminEval.customFile || lastAdminEval.routine!.fileUrl;
    const filePath = fileUrl.startsWith("evaluations/")
      ? path.join(process.cwd(), "uploads", "routines", fileUrl)
      : path.join(process.cwd(), fileUrl.replace(/^\/public\//, "public/"));
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Archivo de rutina no encontrado" });
    }

    // 3) Leemos el workbook y la hoja 3
    const wb = xlsx.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[2]];

    // 4) Preparamos los datos de RM
    const rows: any[][] = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    // 5) Generamos la columna de RM sin pisar filas como "LUNES"
    const rmValues: (number | string)[][] = [];
    for (let i = 6; i < rows.length; i++) {
      const label = (rows[i][1] || "").toString().trim().toLowerCase();
      if (!label || label === "ejercicio" || label === "grupo") {
        rmValues.push([""]);
        continue;
      }
      const match = ejercicios.find(
        (e: any) => e.ejercicio.toLowerCase().trim() === label
      );
      rmValues.push(match ? [calculateRM(match.peso, match.reps)] : [""]);
    }
    const numExercises = ejercicios.length;
    const rmToWrite = rmValues.slice(0, numExercises);
    xlsx.utils.sheet_add_aoa(sheet, rmValues, { origin: "C7" });

    // 6) Escribimos nombre, fecha y edad en las celdas exactas
    //    Ajusta "B2", "D2" y "B3" según tu plantilla real.
    if (nombre) {
      sheet["B1"] = { t: "s", v: nombre }; // Nombre
    }
    // Fecha de hoy
    sheet["B2"] = { t: "s", v: new Date().toLocaleDateString("es-AR") };
    if (edad) {
      sheet["B3"] = { t: "n", v: Number(edad) }; // Edad
    }

    // 7) Guardar el nuevo archivo autoevaluado...
    const evalName = `${userId}-${Date.now()}-self-evaluated.xlsx`;
    const saveDir = path.resolve(process.cwd(), "uploads/routines/evaluations");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    const savePath = path.join(saveDir, evalName);
    xlsx.writeFile(wb, savePath);

    // 8) Registrar la autoevaluación y borrar la solicitud
    await prisma.routineAssignment.create({
      data: {
        userId: Number(userId),
        routineBaseId: lastAdminEval.routineBaseId,
        evaluated: true,
        selfEvaluated: true,
        customFile: `evaluations/${evalName}`,
      },
    });
    await prisma.evaluationRequest.delete({
      where: { id: approvedRequest.id },
    });

    return res.json({
      message: "Autoevaluación completada con éxito",
      evaluatedFile: `evaluations/${evalName}`,
    });
  } catch (err) {
    console.error("❌ Error al autoevaluar:", err);
    res.status(500).json({ message: "Error al autoevaluar rutina" });
  }
};

export const getSelfEvaluatedStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const assignment = await prisma.routineAssignment.findFirst({
      where: {
        userId: Number(userId),
        evaluated: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!assignment) {
      return res.json({ selfEvaluated: false });
    }

    return res.json({ selfEvaluated: assignment.selfEvaluated || false });
  } catch (error) {
    console.error("Error al obtener estado de selfEvaluated:", error);
    return res.status(500).json({ message: "Error al consultar evaluación" });
  }
};

// controllers/routinesController.ts
export const downloadEvaluatedRoutineById = async (
  req: Request<{ userId: string; assignmentId: string }>,
  res: Response
) => {
  const { userId, assignmentId } = req.params;

  try {
    // 1) Asegurarnos que el assignment existe y pertenece al user
    const assignment = await prisma.routineAssignment.findFirst({
      where: {
        id: Number(assignmentId),
        userId: Number(userId),
        evaluated: true,
      },
    });
    if (!assignment || !assignment.customFile) {
      return res.status(404).json({ message: "Rutina evaluada no encontrada" });
    }

    // 2) Leer y servir el archivo
    const filePath = path.join(
      process.cwd(),
      "uploads/routines",
      assignment.customFile
    );
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Archivo no encontrado en disco" });
    }
    return res.download(filePath);
  } catch (error) {
    console.error("Error al descargar rutina evaluada por ID:", error);
    return res
      .status(500)
      .json({ message: "Error al descargar rutina evaluada" });
  }
};
