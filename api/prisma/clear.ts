import { prisma } from "../src/prisma/client";

async function clearDB() {
  try {
    await prisma.notifications.deleteMany();
    await prisma.users.deleteMany();

    console.log("🧹 Base de datos limpiada exitosamente.");
  } catch (err) {
    console.error("❌ Error al limpiar la base de datos:", err);
  } finally {
    await prisma.$disconnect();
  }
}

clearDB();
