// src/index.ts
import express from "express";
import userRoutes from "./routes/usersRoutes";

import adminRoutes from "./routes/adminRoutes";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

const main = async () => {
  // ✅ Esperar a que se cree el admin
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

main().catch((error) => {
  console.error("Error al iniciar la app:", error);
});
