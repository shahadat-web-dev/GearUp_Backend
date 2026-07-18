import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import {
  addGear,
  deleteGear,
  getProviderOrders,
  updateGear,
  updateOrderStatus,
} from "./provider.controller";

const router = Router();

router.post("/gear", auth(Role.PROVIDER), addGear);
router.put("/gear/:id", auth(Role.PROVIDER), updateGear);
router.delete("/gear/:id", auth(Role.PROVIDER), deleteGear);
router.get("/orders", auth(Role.PROVIDER), getProviderOrders);
router.patch("/orders/:id", auth(Role.PROVIDER), updateOrderStatus);

export const providerRouter = router;