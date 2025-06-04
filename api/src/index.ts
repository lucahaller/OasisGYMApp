import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/users", userRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
