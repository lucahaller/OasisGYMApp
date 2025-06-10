import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { login, register } from "../controllers/authController";
const router = Router();

router.post(
  "/register",
  register as (req: Request, res: Response, next: NextFunction) => Promise<void>
);
router.post(
  "/login",
  login as (req: Request, res: Response, next: NextFunction) => Promise<void>
);
export default router;
