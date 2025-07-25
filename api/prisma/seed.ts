import { Role } from "@prisma/client";
import { prisma } from "../../api/src/prisma/client";
const bcrypt = require("bcrypt");

async function seed() {
  await prisma.notifications.deleteMany();
  await prisma.routineAssignment.deleteMany();
  await prisma.routineBase.deleteMany();
  await prisma.users.deleteMany();
  await prisma.evaluationRequest.deleteMany();

  const hashedPassword = await bcrypt.hash("1234", 10);
  const today = new Date();

  const users = [
    {
      name: "Usuario Rojo",
      email: "rojo@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 40 * 86400000),
      payment_expiration: new Date(today.getTime() - 10 * 86400000),
    },
    {
      name: "Usuario Amarillo",
      email: "amarillo@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 25 * 86400000),
      payment_expiration: new Date(today.getTime() + 3 * 86400000),
    },
    {
      name: "Usuario Verde",
      email: "verde@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 10 * 86400000),
      payment_expiration: new Date(today.getTime() + 15 * 86400000),
    },
    {
      name: "Nuevo Usuario",
      email: "nuevo@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 2 * 86400000),
      payment_expiration: new Date(today.getTime() + 28 * 86400000),
    },
    {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: Role.ADMIN,
      last_payment: today,
      payment_expiration: new Date(today.getTime() + 100 * 86400000),
    },
    // Más usuarios para testing visual
    {
      name: "Juan González",
      email: "juan@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 35 * 86400000),
      payment_expiration: new Date(today.getTime() - 5 * 86400000),
    },
    {
      name: "Lucía Méndez",
      email: "lucia@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 27 * 86400000),
      payment_expiration: new Date(today.getTime() + 2 * 86400000),
    },
    {
      name: "Tomás Herrera",
      email: "tomas@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 12 * 86400000),
      payment_expiration: new Date(today.getTime() + 10 * 86400000),
    },
    {
      name: "Agustina López",
      email: "agustina@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 5 * 86400000),
      payment_expiration: new Date(today.getTime() + 20 * 86400000),
    },
    {
      name: "Mateo Pérez",
      email: "mateo@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 50 * 86400000),
      payment_expiration: new Date(today.getTime() - 15 * 86400000),
    },
  ];

  await prisma.users.createMany({ data: users });

  console.log("✅ Seed ejecutado con éxito con múltiples usuarios");
}

seed().catch((e) => console.error("❌ Error en seed:", e));
