// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.notifications.deleteMany();
  await prisma.users.deleteMany();

  await prisma.users.createMany({
    data: [
      {
        name: "Usuario Verde",
        email: "verde@example.com",
        payment_status: "verde",
        last_payment: new Date("2025-06-10"),
        payment_expiration: new Date("2025-07-28"),
        payment_amount: 10000,
      },
      {
        name: "Usuario Amarillo (vence en 3 días)",
        email: "amarillo@example.com",
        payment_status: "amarillo",
        last_payment: new Date("2025-06-01"),
        payment_expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        payment_amount: 9000,
      },
      {
        name: "Usuario Rojo (vencido)",
        email: "rojo@example.com",
        payment_status: "rojo",
        last_payment: new Date("2025-05-01"),
        payment_expiration: new Date("2025-06-01"),
        payment_amount: 7000,
      },
      {
        name: "Usuario sin pago",
        email: "sinpago@example.com",
      },
      {
        name: "Usuario reciente (vence en 10 días)",
        email: "reciente@example.com",
        payment_status: "amarillo",
        last_payment: new Date(),
        payment_expiration: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        payment_amount: 12000,
      },
    ],
  });
}

main()
  .then(() => {
    console.log("✅ Seed ejecutado correctamente");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
