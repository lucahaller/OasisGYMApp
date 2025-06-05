// src/routes/user.routes.ts
import { Router } from "express";
import * as userController from "../controllers/usersController";

const router = Router();

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);

export default router;
