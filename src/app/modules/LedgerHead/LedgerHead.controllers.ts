import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { LedgerHeadService } from "./LedgerHead.service";

const createAccountItem = catchAsync(async (req: Request, res: Response) => {
  const result = await LedgerHeadService.createAccountsItemtoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Accounts Item create Successfully",
    data: result,
  });
});

const getAccountItem = catchAsync(async (req: Request, res: Response) => {
  const query = req.query.ids as string;

  const result = await LedgerHeadService.getAccountsItemFromDB(query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Accounts Item Retrived Successfully",
    data: result,
  });
});

const getAccountItemById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id!);
  const result = await LedgerHeadService.getAccountsItemByIdFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Accounts Item Retrived Successfully",
    data: result,
  });
});

const updateAccountItemById = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id!);

    const result = await LedgerHeadService.updateAccountsItemFromDBbyId(
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Accounts Item Retrived Successfully",
      data: result,
    });
  }
);

export const LedgerHeadController = {
  createAccountItem,
  getAccountItem,
  getAccountItemById,
  updateAccountItemById,
};
