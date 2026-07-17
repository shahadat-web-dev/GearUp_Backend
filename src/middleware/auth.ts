import { NextFunction, Request, Response } from "express";
import { Role, Status } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utilities/catchAsync";
import { verifyToken } from "../utilities/jwt";
import { sendResponse } from "../utilities/sendResponse";


//
declare global {
  namespace Express {
    interface Request {
      user?: { email: string; id: string; name: string; role: Role };
    }
  }
}

export const auth = (...roles: Role[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.assessToken
      ? req.cookies.assessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error("Please Login First!");
    }

    const verified = verifyToken(token, config.JWT_ACCESS_SECRET);
    const { id, name, email, role } = verified;

    if (!roles.includes(role)) {
      return sendResponse(res, "Forbidden!!!", null, 403);
    }

    const userData = await prisma.user.findUnique({ where: { id } });
    if (!userData || userData.status === Status.SUSPENDED) {
      return sendResponse(res, "Your Account is Suspended!", null, 403);
    }

    req.user = { email, id, name, role };
    next();
  });