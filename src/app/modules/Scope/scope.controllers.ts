import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScopeService } from "./scope.service";
import { Request, Response } from "express";

const createScope = catchAsync(async (req: Request, res: Response) => {
  const result = await ScopeService.createScope(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Scope create Successfully",
    data: result,
  });
});

const getAllScope = catchAsync(async (req: Request, res: Response) => {
  const result = await ScopeService.getallScopes();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Scopes retrives  Successfully",
    data: result,
  });
});

export const ScopeControllers = {
  createScope,
  getAllScope,
};
