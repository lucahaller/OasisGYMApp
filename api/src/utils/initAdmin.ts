import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

export const createDefaultAdmin = async () => {
  const adminEmail = "admin@oasisgym.com";
  const existingAdmin = await prisma.users.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10); // Contraseña segura
    await prisma.users.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        created_at: new Date(),
      },
    });
    console.log("✅ Admin creado con éxito.");
  } else {
    console.log("✅ Admin ya existe.");
  }
};
