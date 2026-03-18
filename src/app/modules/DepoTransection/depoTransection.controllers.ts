
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { DepoTransectionService } from "./depoTransection.service";

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
    const result = await DepoTransectionService.getAllDepoAllocation();

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

const updateDepoAllocation = catchAsync(async (req: Request, res: Response) => {
    const result = await DepoTransectionService.updateDepoAllocation(Number(req.params.id), req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Depo Allocation confirmed successfully",
        data: result,
    });
});


export const DepoTransectionController = {
    createDepoAllocation,
    getAllDepoAllocation,
    editDepoAllocation,
    updateDepoAllocation
}