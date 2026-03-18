import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { InventoryProgressService } from "./inventoryProgress.service";



const getInventoryProgressByMPO = catchAsync(async (req, res) => {
    const result = await InventoryProgressService.getInventoryProgressByMPO(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Inventory Progress fetched successfully",
        data: result,
    });
})


const getInventoryProgressByMPOId = catchAsync(async (req, res) => {

    const employeeId = req.params.employeeId as string
    const startDate = req.query.startDate ? req.query.startDate as string : undefined
    const endDate = req.query.endDate ? req.query.endDate as string : undefined

    const result = await InventoryProgressService.getInventoryProgressByMPOIds(employeeId, startDate, endDate);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Inventory Progress fetched successfully",
        data: result,
    });
})

const getProductProgressByDepo = catchAsync(async (req, res) => {

    const depoId = Number(req.query.depoId) || undefined
    const startDate = req.query.startDate ? req.query.startDate as string : undefined
    const endDate = req.query.endDate ? req.query.endDate as string : undefined

    const result = await InventoryProgressService.getProductProgressByDepo(depoId, startDate, endDate);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product Progress fetched successfully",
        data: result,
    });
})


export const InventoryProgressController = {
    getInventoryProgressByMPO,
    getInventoryProgressByMPOId,
    getProductProgressByDepo
}