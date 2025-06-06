import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { register } from "../controllers/authController";
const router = Router();

router.post(
  "/register",
  register as (req: Request, res: Response, next: NextFunction) => Promise<void>
);
export default router;
