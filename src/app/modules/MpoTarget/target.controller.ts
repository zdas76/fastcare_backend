import { StatusCodes } from "http-status-codes";
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

const getAllMpoProgressReport = catchAsync(async (req, res) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const depoId = req.query.depoId ? Number(req.query.depoId) : undefined;

    const result = await MpoTargetService.getAllMpoProgressReport(

        { startDate, endDate, depoId },
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "MPO progress report retrieved successfully",
        data: result,
    });
});

const getAllMpoProgressReportById = catchAsync(async (req, res) => {
    const employeeId = req.params.employeeId;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await MpoTargetService.getAllMpoProgressReportById(
        employeeId,
        { startDate, endDate },
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "MPO progress report retrieved successfully",
        data: result,
    });
});

export const MpoTargetController = {
    createMPOTarget,
    getMPOTarget,
    updateMPOTarget,
    deleteMPOTarget,
    getAllMpoProgressReport,
    getAllMpoProgressReportById
}
