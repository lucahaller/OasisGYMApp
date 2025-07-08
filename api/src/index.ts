// src/index.ts
import express from "express";
import userRoutes from "./routes/usersRoutes";
import clientRoutes from "./routes/clientRoutes";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import routinesRoutes from "./routes/routinesRoutes";
import cors from "cors";
import dotenv from "dotenv";
import { createDefaultAdmin } from "./utils/initAdmin";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/client", clientRoutes);
app.use("/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/routines", routinesRoutes);

const PORT = process.env.PORT || 3000;

const main = async () => {
  await createDefaultAdmin(); // ✅ Esperar a que se cree el admin
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

main().catch((error) => {
  console.error("Error al iniciar la app:", error);
});
