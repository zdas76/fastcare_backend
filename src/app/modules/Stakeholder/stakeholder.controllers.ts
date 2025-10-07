import { StatusCodes } from "http-status-codes";

import type { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { StakeholderService } from "./stakeholder.service";
import sendResponse from "../../shared/sendResponse";

const createStakholder = catchAsync(async (req: Request, res: Response) => {
  const result = await StakeholderService.createStakeholderToDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Stakholder create Successfully",
    data: result,
  });
});

const getStakholder = catchAsync(async (req: Request, res: Response) => {
  const result = await StakeholderService.getStakeholder();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Stakholder retrived Successfully",
    data: result,
  });
});

const getStakholderById = catchAsync(async (req: Request, res: Response) => {
  const result = await StakeholderService.getStakeholderbyId(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Stakholder retrived Successfully",
    data: result,
  });
});

const deleteStakholderById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? "0");

  const result = await StakeholderService.deleteStakeholderbyId(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Stakholder delete Successfully",
    data: result,
  });
});

const updateStakholder = catchAsync(async (req: Request, res: Response) => {
  const result = await StakeholderService.updateStakeholder(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Stakholder updated Successfully",
    data: result,
  });
});

export const StakholderControllers = {
  createStakholder,
  getStakholder,
  updateStakholder,
  getStakholderById,
  deleteStakholderById,
};
