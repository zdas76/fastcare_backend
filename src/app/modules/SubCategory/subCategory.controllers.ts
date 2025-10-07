import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SubCagetoryService } from "./subCategory.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

const createSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCagetoryService.createSubCategoryToDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category create Successfully",
    data: result,
  });
});

const getSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCagetoryService.getSubCategory();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category retrived Successfully",
    data: result,
  });
});

const getSubCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCagetoryService.getSubCategorybyId(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category retrived Successfully",
    data: result,
  });
});

const updateSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCagetoryService.subCategoryUpdate(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category updated Successfully",
    data: result,
  });
});

const deleteSubCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id!);

    const result = await SubCagetoryService.deleteSubCategorybyId(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Sub-Category delete Successfully",
      data: result,
    });
  }
);

export const SubCategoryControllers = {
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  getSubCategoryById,
  deleteSubCategoryById,
};
