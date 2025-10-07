import { StatusCodes } from "http-status-codes";

import type { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { DesignationService } from "./designation.service";
import sendResponse from "../../shared/sendResponse";

const createDesignation = catchAsync(async (req: Request, res: Response) => {
  const result = await DesignationService.createDesignation(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Designation create Successfully",
    data: result,
  });
});

const getDesignation = catchAsync(async (req: Request, res: Response) => {
  const result = await DesignationService.getDesignation();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Designation retrived Successfully",
    data: result,
  });
});

const getDesignationById = catchAsync(async (req: Request, res: Response) => {
  const result = await DesignationService.getDesignationbyId(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Designation retrived Successfully",
    data: result,
  });
});

const deleteDesignationById = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id ?? "0");

    const result = await DesignationService.deleteDesignationbyId(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Designation delete Successfully",
      data: result,
    });
  }
);

const updateDesignation = catchAsync(async (req: Request, res: Response) => {
  const result = await DesignationService.updateDesignation(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Designation updated Successfully",
    data: result,
  });
});

export const DesignationControllers = {
  createDesignation,
  getDesignation,
  updateDesignation,
  getDesignationById,
  deleteDesignationById,
};
