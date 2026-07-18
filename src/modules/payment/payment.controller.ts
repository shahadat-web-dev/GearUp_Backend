import { Request, Response } from "express";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import {
  confirmPaymentDb,
  createPaymentDb,
  getMyPaymentsDb,
  getPaymentByIdDb,
  stripeWebhookDb,
} from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await createPaymentDb(req.user?.id as string, req.body);
  sendResponse(res, "Payment session created, complete payment now!", result, 201);
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await confirmPaymentDb(req.body.transactionId);
  sendResponse(res, "Payment confirmed successfully", result);
});

const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const result = await stripeWebhookDb(req.body, signature);
  sendResponse(res, "Webhook received", result);
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await getMyPaymentsDb(req.user?.id as string);
  sendResponse(res, "Payment history fetched successfully", result);
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await getPaymentByIdDb(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role as Role,
  );
  sendResponse(res, "Payment details fetched successfully", result);
});

export {
  confirmPayment,
  createPayment,
  getMyPayments,
  getPaymentById,
  stripeWebhook,
};