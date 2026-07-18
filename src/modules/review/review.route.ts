import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { createReview } from "./review.controller";

const router = Router();

router.post("/", auth(Role.CUSTOMER), createReview);

export const reviewRouter = router;