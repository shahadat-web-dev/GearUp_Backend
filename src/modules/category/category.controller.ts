import { Request, Response } from "express";
import { catchAsync } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import {
  createCategoryDb,
  deleteCategoryDb,
  getCategoriesDb,
  updateCategoryDb,
} from "./category.service";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await getCategoriesDb();
  sendResponse(res, "Categories fetched successfully", result);
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await createCategoryDb(req.body);
  sendResponse(res, "Category created successfully", result, 201);
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await updateCategoryDb(req.params.id as string, req.body);
  sendResponse(res, "Category updated successfully", result);
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await deleteCategoryDb(req.params.id as string);
  sendResponse(res, "Category deleted successfully", result);
});

export { createCategory, deleteCategory, getAllCategories, updateCategory };