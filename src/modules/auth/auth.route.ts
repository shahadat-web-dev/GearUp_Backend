import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { getMyInfo, loginUser, regUser } from "./auth.controller";

const router = Router();

router.post("/register", regUser);
router.post("/login", loginUser);
router.get("/me", auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER), getMyInfo);

export const authRouter = router;