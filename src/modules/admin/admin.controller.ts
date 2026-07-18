import { Request, Response } from "express";
import { catchAsync } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import {
  getAllGearListingsDb,
  getAllRentalsDb,
  getAllUsersDb,
  updateUserStatusDb,
} from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllUsersDb();
  sendResponse(res, "Users fetched successfully", result);
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await updateUserStatusDb(
    req.params.id as string,
    req.body.status,
  );
  sendResponse(res, "User status updated successfully", result);
});

const getAllGearListings = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllGearListingsDb();
  sendResponse(res, "Gear listings fetched successfully", result);
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await getAllRentalsDb();
  sendResponse(res, "Rental orders fetched successfully", result);
});

export { getAllGearListings, getAllRentals, getAllUsers, updateUserStatus };