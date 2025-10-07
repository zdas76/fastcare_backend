import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { DepoService } from "./depo.service";

const AddDepo = catchAsync(async (req: Request, res: Response) => {
  const result = await DepoService.createDepo(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Depo create Successfully",
    data: result,
  });
});

const getAllDepo = catchAsync(async (req: Request, res: Response) => {
  const result = await DepoService.getAllDepo();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Depoes retrived Successfully",
    data: result,
  });
});

const getDepoByid = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await DepoService.getDepoById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Depo retrived Successfully",
    data: result,
  });
});

const UpdateDepoByid = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await DepoService.updateDepo(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Depo retrived Successfully",
    data: result,
  });
});

export const DepoControllers = {
  AddDepo,
  getAllDepo,
  getDepoByid,
  UpdateDepoByid,
};
