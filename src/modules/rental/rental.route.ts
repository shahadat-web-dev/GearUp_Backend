import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import {
  cancelRental,
  createRental,
  getMyRentals,
  getRentalById,
} from "./rental.controller";

const router = Router();

router.post("/", auth(Role.CUSTOMER), createRental);
router.get("/", auth(Role.CUSTOMER), getMyRentals);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), getRentalById);
router.patch("/:id/cancel", auth(Role.CUSTOMER), cancelRental);

export const rentalRouter = router;