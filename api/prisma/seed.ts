import { Role } from "@prisma/client";
import { prisma } from "../../api/src/prisma/client";
const bcrypt = require("bcrypt");

async function seed() {
  await prisma.notifications.deleteMany();
  await prisma.users.deleteMany();

  const hashedPassword = await bcrypt.hash("1234", 10);

  const today = new Date();

  const users = [
    {
      name: "Usuario Rojo",
      email: "rojo@example.com",
      password: hashedPassword,
      role: Role.USER, // 👈 usa enum, no string
      last_payment: new Date(today.getTime() - 40 * 86400000),
      payment_expiration: new Date(today.getTime() - 10 * 86400000),
    },
    {
      name: "Usuario Amarillo",
      email: "amarillo@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 25 * 86400000),
      payment_expiration: new Date(today.getTime() + 5 * 86400000),
    },
    {
      name: "Usuario Verde",
      email: "verde@example.com",
      password: hashedPassword,
      role: Role.USER,
      last_payment: new Date(today.getTime() - 15 * 86400000),
      payment_expiration: new Date(today.getTime() + 14 * 86400000),
    },
    {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: Role.ADMIN,
      last_payment: null,
      payment_expiration: null,
    },
  ];

  await prisma.users.createMany({ data: users });
  console.log("✅ Seed ejecutado con éxito");
}

seed().catch((e) => console.error("❌ Error:", e));
