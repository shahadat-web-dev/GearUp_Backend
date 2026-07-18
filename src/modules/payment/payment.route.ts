import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import {
  confirmPayment,
  createPayment,
  getMyPayments,
  getPaymentById,
} from "./payment.controller";

const router = Router();

router.post("/create", auth(Role.CUSTOMER), createPayment);
router.post("/confirm", auth(Role.CUSTOMER), confirmPayment);
router.get("/", auth(Role.CUSTOMER), getMyPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), getPaymentById);

export const paymentRouter = router;