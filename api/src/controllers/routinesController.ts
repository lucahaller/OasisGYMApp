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
      routine = await prisma.routine.create({
        data: {
          name: file.originalname.replace(".xlsx", ""),
          type: "personalizada",
          days: 3, // Podés dejarlo fijo o dejar que lo mande el admin si querés
          fileUrl: `/public/routines/${filename}`,
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
  const { ejercicios, nombre, edad } = req.body; // 💡 Pasamos también datos personales

  try {
    const assignment = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      include: { routine: true },
    });
    if (!assignment)
      return res.status(404).json({ message: "No tiene rutina" });

    let filePath = "";
    if (assignment.customFile) {
      // archivo evaluado (lo guardas en uploads/routines/evaluations)
      filePath = path.join(
        process.cwd(),
        "uploads",
        "routines",
        assignment.customFile
      );
    } else if (assignment.routine?.fileUrl) {
      // archivo base (fileUrl apunta a /public/…)
      filePath = path.join(
        process.cwd(),
        assignment.routine.fileUrl.replace(/^\/public\//, "public/")
      );
    } else {
      return res.status(404).json({ message: "No tiene rutina asignada" });
    }

    if (!fs.existsSync(filePath)) {
      console.error("🔍 Buscando aquí:", filePath);
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    const wb = xlsx.readFile(filePath);
    const sheetName = wb.SheetNames[2];
    const sh = wb.Sheets[sheetName];

    // ✅ AGREGADO: Insertar datos personales si existen
    const etiquetas = {
      NOMBRE: nombre || "",
      FECHA: new Date().toLocaleDateString("es-AR"),
      EDAD: edad || "",
    };

    for (let i = 1; i <= 10; i++) {
      const keyCell = sh[`A${i}`];
      if (!keyCell) continue;

      const label = keyCell.v?.toString().trim().toUpperCase();
      if (etiquetas[label]) {
        sh[`B${i}`] = { t: "s", v: etiquetas[label].toString() };
      }
    }

    // 🧠 Setear RM en columna C como ya venías haciendo
    const rows: any[][] = xlsx.utils.sheet_to_json(sh, {
      header: 1,
      defval: "",
    });

    const rmCol: (number | string)[][] = [];
    for (let i = 6; i < rows.length; i++) {
      const nombre: string = (rows[i][1] || "").toString().trim().toLowerCase();
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

    xlsx.utils.sheet_add_aoa(sh, rmCol, { origin: "C7" });

    const evalName = `${userId}-${Date.now()}-evaluated.xlsx`;
    const saveDir = path.resolve(process.cwd(), "uploads/routines/evaluations");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    const savePath = path.join(saveDir, evalName);
    xlsx.writeFile(wb, savePath);

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
    await prisma.evaluationRequest.deleteMany({
      where: {
        userId: Number(userId),
      },
    });
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

export const selfEvaluateRoutine = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { ejercicios, nombre, edad } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || user.payment_status === "red") {
      return res
        .status(403)
        .json({ message: "Pago inactivo. No puede autoevaluarse." });
    }

    const lastSelfEval = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId), selfEvaluated: true },
      orderBy: { updatedAt: "desc" },
    });

    if (lastSelfEval) {
      const dias =
        (Date.now() - new Date(lastSelfEval.updatedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (dias < 30) {
        return res.status(403).json({
          message: `Ya realizaste una autoevaluación hace menos de 30 días. Intenta en ${Math.ceil(
            30 - dias
          )} días.`,
        });
      }
    }

    const assignment = await prisma.routineAssignment.findFirst({
      where: { userId: Number(userId), evaluated: true },
      orderBy: { createdAt: "desc" },
      include: { routine: true },
    });

    if (!assignment)
      return res
        .status(404)
        .json({ message: "No se encontró rutina evaluada base" });

    const fileUrl = assignment.customFile || assignment.routine!.fileUrl;
    const filePath = path.resolve(
      process.cwd(),
      fileUrl.replace(/^\/public\//, "public/")
    );

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Archivo de rutina no encontrado" });
    }

    const wb = xlsx.readFile(filePath);
    const sheetName = wb.SheetNames[2];
    const sh = wb.Sheets[sheetName];
    const rows: any[][] = xlsx.utils.sheet_to_json(sh, {
      header: 1,
      defval: "",
    });

    const rmCol: (number | string)[][] = [];
    for (let i = 6; i < rows.length; i++) {
      const nombreEj = (rows[i][1] || "").toString().trim().toLowerCase();
      if (!nombreEj || nombreEj === "ejercicio" || nombreEj === "grupo") {
        rmCol.push([""]);
        continue;
      }

      const match = ejercicios.find(
        (e: any) => e.ejercicio.toLowerCase().trim() === nombreEj
      );
      if (match) {
        rmCol.push([calculateRM(match.peso, match.reps)]);
      } else {
        rmCol.push([""]);
      }
    }

    xlsx.utils.sheet_add_aoa(sh, rmCol, { origin: "C7" });

    // Extra: Agregar nombre y edad al principio si existe
    if (nombre) sh["B2"] = { t: "s", v: nombre };
    if (edad) sh["B4"] = { t: "s", v: `${edad}` };
    sh["B3"] = { t: "s", v: new Date().toLocaleDateString("es-AR") };

    const evalName = `${userId}-${Date.now()}-self-evaluated.xlsx`;
    const saveDir = path.resolve(process.cwd(), "uploads/routines/evaluations");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    const savePath = path.join(saveDir, evalName);
    xlsx.writeFile(wb, savePath);

    const nuevaRutina = await prisma.routineAssignment.create({
      data: {
        userId: Number(userId),
        evaluated: true,
        selfEvaluated: true,
        customFile: `evaluations/${evalName}`,
      },
    });

    res.json({
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
