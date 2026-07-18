import { Request, Response } from "express";
import { catchAsync } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import { createReviewDb } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await createReviewDb(req.user?.id as string, req.body);
  sendResponse(res, "Review submitted successfully", result, 201);
});

export { createReview };