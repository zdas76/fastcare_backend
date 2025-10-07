import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { DegreeService } from "./degree.service";
import sendResponse from "../../shared/sendResponse";

const createDegree = catchAsync(async (req: Request, res: Response) => {
  const result = await DegreeService.createDegreeToDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Degree create Successfully",
    data: result,
  });
});

const getDegree = catchAsync(async (req: Request, res: Response) => {
  const result = await DegreeService.getDegrees();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Degree retrived Successfully",
    data: result,
  });
});

const getDegreeById = catchAsync(async (req: Request, res: Response) => {
  const result = await DegreeService.getDegreeybyId(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Degree retrived Successfully",
    data: result,
  });
});

const deleteDegreeById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? "0");

  const result = await DegreeService.deleteDegreebyId(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Degree delete Successfully",
    data: result,
  });
});

const updateDegree = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await DegreeService.updateDegree(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Degree updated Successfully",
    data: result,
  });
});

export const DegreeControllers = {
  createDegree,
  getDegree,
  updateDegree,
  getDegreeById,
  deleteDegreeById,
};
