import { Request, Response } from "express";
import * as userService from "../services/userService";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAll();
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const newUser = await userService.create({ name, email, password });
  res.status(201).json(newUser);
};
