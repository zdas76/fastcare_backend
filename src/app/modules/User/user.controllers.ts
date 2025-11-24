import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../shared/sendResponse";
import { UserfiltersFields } from "./user.constant";
import { UserService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.creatUserToDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Employee create successfully",
    data: result,
  });
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, UserfiltersFields);
  const paginat = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await UserService.getAllUser(filters, paginat);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Employees retrived Successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id!);
  const result = await UserService.getUserById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Employee retrived Successfully",
    data: result,
  });
});

const updateUserById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id!);

  const result = await UserService.updateUserById(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Employee retrived Successfully",
    data: result,
  });
});

const deleteUserById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id!);
  const result = await UserService.deleteUserById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Employee deleted Successfully",
    data: result,
  });
});

export const UserControllers = {
  getUser,
  getUserById,
  updateUserById,
  createUser,
  deleteUserById,
};
