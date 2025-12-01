import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../shared/sendResponse";
import { partyfiltersFields } from "./chemist.constant";
import { ChemistService } from "./chemist.service";

const createChemist = catchAsync(async (req: Request, res: Response) => {
  const result = await ChemistService.createChemist(req);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Employee create successfully",
    data: result,
  });
});

const getAllChemist = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, partyfiltersFields);
  const paginat = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await ChemistService.getAllChemist(filters, paginat);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Chemists retrived Successfully",
    data: result,
  });
});

const getChemistById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id!);

  const result = await ChemistService.getChemistById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Chemist retrived Successfully",
    data: result,
  });
});

const updateChemistById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id!);

  const result = await ChemistService.updateChemistById(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Chemist Update Successfully",
    data: result,
  });
});

const deleteChemistById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id!);

  const result = await ChemistService.deleteChemistById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Chemist Delete Successfully",
    data: result,
  });
});

export const ChemistControllers = {
  createChemist,
  getAllChemist,
  getChemistById,
  updateChemistById,
  deleteChemistById,
  // getChemistLedger,
};
