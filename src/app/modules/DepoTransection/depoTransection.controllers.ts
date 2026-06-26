
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { DepoTransectionService } from "./depoTransection.service";
import { VoucherType } from "../../../../generated/prisma";

const createDepoAllocation = catchAsync(async (req: Request, res: Response) => {
    const result = await DepoTransectionService.createDepoAllocation(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Allocation create successfully",
        data: result,
    });
});


const getAllDepoAllocation = catchAsync(async (req: Request, res: Response) => {

    const voucherType = req.params.voucherType as VoucherType

    const result = await DepoTransectionService.getAllDepoVouchers(voucherType);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Allocation create successfully",
        data: result,
    });
});

const editDepoAllocation = catchAsync(async (req: Request, res: Response) => {
    const result = await DepoTransectionService.editDepoAllocation(Number(req.params.id), req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Allocation updated successfully",
        data: result,
    });
});

const approveDepoAllocation = catchAsync(async (req: Request, res: Response) => {
    const result = await DepoTransectionService.approveDepoAllocation(Number(req.params.id), req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Allocation confirmed successfully",
        data: result,
    });
});

const confirmDepoAllocation = catchAsync(async (req: Request, res: Response) => {

    const result = await DepoTransectionService.confirmDepoAllocation(Number(req.params.id), req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Allocation confirmed successfully",
        data: result,
    });
});

const createDepoPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await DepoTransectionService.createDepoPayment(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Payment create successfully",
        data: result,
    });
});

const getDepoVoucherById = catchAsync(async (req: Request, res: Response) => {
    const result = await DepoTransectionService.getDepoVoucherById(Number(req.params.id));

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Voucher get successfully",
        data: result,
    });
});

const deleteDepoAllocation = catchAsync(async (req: Request, res: Response) => {

    const result = await DepoTransectionService.deleteDepoAllocation(Number(req.params.id));

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Allocation deleted successfully",
        data: result,
    });
});

const updateDepoPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await DepoTransectionService.updateDepoPayment(Number(req.params.id), req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Payment updated successfully",
        data: result,
    });
});

const createDepoReceive = catchAsync(async (req: Request, res: Response) => {
    const result = await DepoTransectionService.createDepoReceive(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Receive create successfully",
        data: result,
    });
});



export const DepoTransectionController = {
    createDepoAllocation,
    getAllDepoAllocation,
    editDepoAllocation,
    approveDepoAllocation,
    confirmDepoAllocation,
    createDepoPayment,
    getDepoVoucherById,
    deleteDepoAllocation,
    updateDepoPayment,
    createDepoReceive,

}