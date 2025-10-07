import { Request, Response } from "express";
import { CustomerService } from "./customer.service";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

const getCustomerById = catchAsync(async (req: Request, res: Response) => {
  const contactNumber = req.query.contact as string;

  const result = await CustomerService.getCustomerById(contactNumber);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "contact Number get Successfully",
    data: result,
  });
});

export const CustomerControllers = {
  getCustomerById,
};
