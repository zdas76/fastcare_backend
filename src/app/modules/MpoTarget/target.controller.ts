import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { MpoTargetService } from "./target.service";


const createMPOTarget = catchAsync(async (req, res) => {
    const result = await MpoTargetService.createMPOTarget(req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "MPOTarget created successfully",
        data: result,
    });
})

const getMPOTarget = catchAsync(async (req, res) => {
    const result = await MpoTargetService.getMPOTarget();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "MPOTarget fetched successfully",
        data: result,
    });
})

const updateMPOTarget = catchAsync(async (req, res) => {

    const id = Number(req.params.id);

    const result = await MpoTargetService.updateMPOTarget(req.body, id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "MPOTarget updated successfully",
        data: result,
    });
})

const deleteMPOTarget = catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    const result = await MpoTargetService.deleteMPOTarget(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "MPOTarget deleted successfully",
        data: result,
    });
})

export const MpoTargetController = {
    createMPOTarget,
    getMPOTarget,
    updateMPOTarget,
    deleteMPOTarget
}
