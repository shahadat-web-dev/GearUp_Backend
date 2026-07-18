import { Request, Response } from "express";
import { catchAsync } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import { ISearchTerm } from "./gear.interface";
import { createGearDb, deleteGearDb, getGearByIdDb, getGearDb, updateGearDb } from "./gear.service";


const createGear = catchAsync(async (req: Request, res: Response) => {
  const result = await createGearDb(req.body, req.user!.id);

  sendResponse(res, "Gear created successfully", result, 201);
});


const updateGear = catchAsync(async (req: Request, res: Response) => {
  const result = await updateGearDb(
    req.params.id as string,
    req.body,
    req.user!.id,
  );

  sendResponse(res, "Gear updated successfully", result);
});


const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteGearDb(
    req.params.id as string,
    req.user!.id,
  );

  sendResponse(res, "Gear deleted successfully", result);
});


const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const query: ISearchTerm = req.query;
  const result = await getGearDb(query);

  sendResponse(res, "Gear fetched successfully", result);
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const result = await getGearByIdDb(req.params.id as string);

  sendResponse(res, "Gear details fetched successfully", result);
});

export { getAllGear, getGearById, createGear, updateGear, deleteGear };