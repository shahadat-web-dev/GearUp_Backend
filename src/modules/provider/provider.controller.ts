import { Request, Response } from "express";
import { catchAsync } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import {
  addGearDb,
  deleteGearDb,
  getProviderOrdersDb,
  updateGearDb,
  updateOrderStatusDb,
} from "./provider.service";

const addGear = catchAsync(async (req: Request, res: Response) => {
  const result = await addGearDb(req.user?.id as string, req.body);
  sendResponse(res, "Gear added successfully", result, 201);
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const result = await updateGearDb(
    req.user?.id as string,
    req.params.id as string,
    req.body,
  );
  sendResponse(res, "Gear updated successfully", result);
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteGearDb(
    req.user?.id as string,
    req.params.id as string,
  );
  sendResponse(res, "Gear removed successfully", result);
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await getProviderOrdersDb(req.user?.id as string);
  sendResponse(res, "Provider orders fetched successfully", result);
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await updateOrderStatusDb(
    req.user?.id as string,
    req.params.id as string,
    req.body.status,
  );
  sendResponse(res, "Order status updated successfully", result);
});

export { addGear, deleteGear, getProviderOrders, updateGear, updateOrderStatus };