import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { OrderService } from "./ordet.service";

const createOrder = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req?.user;

    const result = await OrderService.createOrder(req.body, user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Order created Successfully",
      data: result,
    });
  }
);

const getAllOrder = catchAsync(async (req: Request, res: Response) => {
  const status = req.query.status as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const result = await OrderService.getAllOrder(status, startDate, endDate);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrived Successfully",
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await OrderService.getOrderById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrieved Successfully",
    data: result,
  });
});

const UpdateOrderById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await OrderService.UpdateOrder(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrieved Successfully",
    data: result,
  });
});

const changeOrderStatusByOrderNo = catchAsync(
  async (req: Request, res: Response) => {
    const orderNo = req.params.orderNo as string;

    const result = await OrderService.changeOrderStatus(orderNo, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Order retrieved Successfully",
      data: result,
    });
  }
);

export const OrderControllers = {
  createOrder,
  getAllOrder,
  getOrderById,
  UpdateOrderById,
  changeOrderStatusByOrderNo,
};
