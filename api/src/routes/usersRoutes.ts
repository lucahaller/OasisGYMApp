// src/routes/user.routes.ts
import { Router } from "express";
import { asyncHandler } from "../utils/asycHandler";
import * as userController from "../controllers/usersController";

const router = Router();

router.get(
  "/",

  userController.getAllUsers
);
router.post("/", userController.createUser);
router.get(
  "/profile",

  userController.getProfile
);
router.put(
  "/update/:id",

  userController.updateProfile
);
router.get(
  "/:id",

  userController.getUserById
);
router.delete(
  "/:id",

  asyncHandler(userController.deleteUser)
);

router.put(
  "/pay/:id",

  asyncHandler(userController.creditUserPayment)
);
export default router;
