import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);
  const today = new Date();

  const createDateOffset = (days: number) => {
    const expiration = new Date(today);
    expiration.setDate(expiration.getDate() + days);
    const lastPayment = new Date(expiration);
    lastPayment.setMonth(lastPayment.getMonth() - 1); // pago hace un mes
    return { last_payment: lastPayment, payment_expiration: expiration };
  };

  await prisma.users.createMany({
    data: [
      {
        name: "Vence en 7 días",
        email: "vence7@example.com",
        password: hashedPassword,
        ...createDateOffset(7),
        payment_amount: 5000,
      },
      {
        name: "Vence en 5 días",
        email: "vence5@example.com",
        password: hashedPassword,
        ...createDateOffset(5),
        payment_amount: 5000,
      },
      {
        name: "Vence en 3 días",
        email: "vence3@example.com",
        password: hashedPassword,
        ...createDateOffset(3),
        payment_amount: 5000,
      },
      {
        name: "Vence en 1 día",
        email: "vence1@example.com",
        password: hashedPassword,
        ...createDateOffset(1),
        payment_amount: 5000,
      },
      {
        name: "Pago vencido",
        email: "vencido@example.com",
        password: hashedPassword,
        last_payment: new Date("2024-06-01"),
        payment_expiration: new Date("2024-07-01"),
        payment_amount: 5000,
      },
      {
        name: "Sin pagos aún",
        email: "sinpago@example.com",
        password: hashedPassword,
        last_payment: null,
        payment_expiration: null,
        payment_amount: null,
      },
    ],
  });

  console.log("✅ Seed con usuarios de prueba insertado correctamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
