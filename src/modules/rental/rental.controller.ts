import { Request, Response } from "express";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import {
  cancelRentalDb,
  createRentalDb,
  getMyRentalsDb,
  getRentalByIdDb,
} from "./rental.service";

const createRental = catchAsync(async (req: Request, res: Response) => {
  const result = await createRentalDb(req.user?.id as string, req.body);
  sendResponse(res, "Rental order placed successfully", result, 201);
});

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await getMyRentalsDb(req.user?.id as string);
  sendResponse(res, "Rental orders fetched successfully", result);
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
  const result = await getRentalByIdDb(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role as Role,
  );
  sendResponse(res, "Rental order details fetched successfully", result);
});

const cancelRental = catchAsync(async (req: Request, res: Response) => {
  const result = await cancelRentalDb(
    req.params.id as string,
    req.user?.id as string,
  );
  sendResponse(res, "Rental order cancelled successfully", result);
});

export { cancelRental, createRental, getMyRentals, getRentalById };