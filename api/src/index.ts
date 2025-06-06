// src/index.ts
import express from "express";
import userRoutes from "./routes/usersRoutes";
import authRoutes from "./routes/authRoutes";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());

app.use("/users", userRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
