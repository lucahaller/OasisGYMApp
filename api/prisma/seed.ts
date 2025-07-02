import { PrismaClient } from "@prisma/client";

const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.users.createMany({
    data: [
      {
        name: "Usuario Pago Válido",
        email: "valido@example.com",
        password: hashedPassword,
        age: 30,
        height: 175,
        weight: 70,
        notes: "Todo bien",
        last_payment: new Date("2025-06-20"),
        payment_expiration: new Date("2025-07-20"),
        payment_amount: 5000,
      },
      {
        name: "Usuario Pago por Vencer",
        email: "vencer@example.com",
        password: hashedPassword,
        age: 28,
        height: 170,
        weight: 65,
        notes: "Revisar expiración",
        last_payment: new Date("2025-06-25"),
        payment_expiration: new Date("2025-07-02"),
        payment_amount: 5000,
      },
      {
        name: "Usuario Pago Vencido",
        email: "vencido@example.com",
        password: hashedPassword,
        age: 35,
        height: 180,
        weight: 80,
        notes: "Debe renovar",
        last_payment: new Date("2025-05-20"),
        payment_expiration: new Date("2025-06-20"),
        payment_amount: 5000,
      },
      {
        name: "Usuario Sin Pago",
        email: "sinpago@example.com",
        password: hashedPassword,
        age: 22,
        height: 165,
        weight: 60,
        notes: "Nuevo ingreso",
        last_payment: null,
        payment_expiration: null,
        payment_amount: null,
      },
    ],
  });

  console.log("✅ Usuarios insertados correctamente con contraseñas.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
