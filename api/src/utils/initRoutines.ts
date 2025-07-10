import { prisma } from "../prisma/client";

const routines = [
  {
    name: "COMB. MUJ FZA-RESISTENCIA.xls",
    type: "FZA-Resistencia",
    days: 3,
    fileUrl: "/public/routines/COMB.MUJ FZA-RESISTENCIA.xls",
    reusable: true,
  },
  {
    name: "COMBINADA (5DIAS)",
    type: "Combinada",
    days: 4,
    fileUrl: "/public/routines/COMBINADA5DIAS.xls",
    reusable: true,
  },
  {
    name: "COMBINADA FUERZA-HIPERTROFIA",
    type: "Combinada",
    days: 4,
    fileUrl: "/public/routines/COMBINADAFUERZA-HIPERTROFIA.xls",
    reusable: true,
  },
  {
    name: "COMBINADA MUJERES FZA-RESISTENCIA",
    type: "Combinada Mujeres",
    days: 4,
    fileUrl: "/public/routines/COMBINADAMUJERESFZA-RESISTENCIA.xls",
    reusable: true,
  },
];

export async function initRoutineBases() {
  for (const routine of routines) {
    const exists = await prisma.routineBase.findFirst({
      where: { name: routine.name },
    });

    if (!exists) {
      await prisma.routineBase.create({ data: routine });
      console.log(`✅ Rutina creada: ${routine.name}`);
    } else {
      console.log(`ℹ️ Ya existe: ${routine.name}`);
    }
  }
}
