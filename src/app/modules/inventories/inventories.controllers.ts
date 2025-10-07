import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import { InventoryService } from "./inventories.service";
import sendResponse from "../../shared/sendResponse";

const getInventory = catchAsync(async (req: Request, res: Response) => {
  const depoId = Number(req.query.depoId);
  const endDate = req.query.endDate as string;
  const startDate = req.query.startDate as string;

  const result = await InventoryService.getInventory(
    depoId,
    startDate,
    endDate
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Inventory retrived Successfully",
    data: result,
  });
});

const getInventoryById = catchAsync(async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  const depoId = Number(req.query.depoId);

  const startDate =
    typeof req.query.startDate === "string" && req.query.startDate
      ? new Date(req.query.startDate)
      : null;
  const endDate =
    typeof req.query.endDate === "string" && req.query.endDate
      ? new Date(req.query.endDate)
      : null;

  const result = await InventoryService.getInventoryById(
    productId,
    depoId,
    startDate,
    endDate
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Parties retrived Successfully",
    data: result,
  });
});

const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await InventoryService.updateInventory(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Parties retrived Successfully",
    data: result,
  });
});

const deleteInventory = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await InventoryService.deleteInventory(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Inventory delete Successfully",
    data: result,
  });
});

const getInventoryTotal = catchAsync(async (req: Request, res: Response) => {
  const result: any = await InventoryService.getInventoryTotalById(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Inventory retrived Successfully",
    data: result[0],
  });
});

export const InventoryControllers = {
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getInventoryTotal,
};
