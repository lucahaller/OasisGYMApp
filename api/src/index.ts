// src/index.ts
import express from "express";
import userRoutes from "./routes/usersRoutes";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
