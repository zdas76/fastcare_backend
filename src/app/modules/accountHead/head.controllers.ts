import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AccountsHeadService } from "./head.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

const createAccountsHead = catchAsync(async (req: Request, res: Response) => {
  const result = await AccountsHeadService.createHeadItemIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Accounts Head Create Successfuly",
    data: result,
  });
});

const getAccountHead = catchAsync(async (req: Request, res: Response) => {
  const result = await AccountsHeadService.getAllHeadItem();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Accounts Head retrived Successfuly",
    data: result,
  });
});

export const AccountHeadControllers = {
  createAccountsHead,
  getAccountHead,
};
