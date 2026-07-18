import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "./category.controller";

const router = Router();

router.get("/", getAllCategories);
router.post("/", auth(Role.ADMIN), createCategory);
router.patch("/:id", auth(Role.ADMIN), updateCategory);
router.delete("/:id", auth(Role.ADMIN), deleteCategory);

export const categoryRouter = router;