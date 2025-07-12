import { Role } from "@prisma/client"; // o donde tengas el enum Role

declare global {
  namespace Express {
    interface User {
      id: number;
      role: Role | string; // si usás Role de Prisma, o string
    }

    interface Request {
      user?: User; // el ? si puede que no venga en todos los requests
    }
  }
}
