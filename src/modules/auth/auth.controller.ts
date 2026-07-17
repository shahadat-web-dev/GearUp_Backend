import { Request, Response } from "express";
import { catchAsync } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import { getInfoDb, loginUserDb, regUserDb } from "./auth.service";

const regUser = catchAsync(async (req: Request, res: Response) => {
  const result = await regUserDb(req.body);
  sendResponse(res, "User Registered Success, Please Login Now!", result, 201);
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken, accessToken } = await loginUserDb(req.body);

  // set into cookie
  res.cookie("assessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, "login Success!", { refreshToken, accessToken });
});

const getMyInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await getInfoDb(req.user?.email as string);
  sendResponse(res, "User Info Retrieve Success!", result);
});

export { getMyInfo, loginUser, regUser };