import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import {
  getAllGearListings,
  getAllRentals,
  getAllUsers,
  updateUserStatus,
} from "./admin.controller";

const router = Router();

router.get("/users", auth(Role.ADMIN), getAllUsers);
router.patch("/users/:id", auth(Role.ADMIN), updateUserStatus);
router.get("/gear", auth(Role.ADMIN), getAllGearListings);
router.get("/rentals", auth(Role.ADMIN), getAllRentals);

export const adminRouter = router;