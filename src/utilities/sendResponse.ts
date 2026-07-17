import { Response } from "express";

export const sendResponse = (
  res: Response,
  message: string,
  data?: any,
  statusCode = 200,
) => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};