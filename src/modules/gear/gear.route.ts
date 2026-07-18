import { Router } from "express";
import { createGear, deleteGear, getAllGear, getGearById, updateGear } from "./gear.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.PROVIDER), createGear);
router.get("/", getAllGear);
router.get("/:id", getGearById);
router.patch("/:id", auth(Role.PROVIDER), updateGear);
router.delete("/:id", auth(Role.PROVIDER), deleteGear);
export const gearRouter = router;