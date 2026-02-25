import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReportManagementService } from "./report.service";

const geMpoTransectionReport = catchAsync(async (req, res) => {
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const result = await ReportManagementService.getAllMpoTransection({
    startDate,
    endDate,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "MPO's transactions retrieved Successfully",
    data: result,
  });
});

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

const getMpoReportById = catchAsync(async (req, res) => {
  const employeeId = req.params.employeeId;

  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const result = await ReportManagementService.getMpoReportByEmployeeId(
    employeeId,
    { startDate, endDate },
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "MPO transactions retrieved successfully",
    data: result,
  });
});

const getGiftVoucherReport = catchAsync(async (req, res) => {
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const result = await ReportManagementService.getGiftVoucherReport({
    startDate,
    endDate,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Gift voucher retrieved successfully",
    data: result,
  });
});

const getAllMpoProgressReport = catchAsync(async (req, res) => {
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const result = await ReportManagementService.getAllMpoProgressReport(

    { startDate, endDate },
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "MPO progress report retrieved successfully",
    data: result,
  });
});

const getDipoMpoReport = catchAsync(async (req, res) => {
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const result = await ReportManagementService.getDipoMpoReport({
    startDate,
    endDate,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Dipo MPO report retrieved successfully",
    data: result,
  });
});

const getDipoMpoReportById = catchAsync(async (req, res) => {
  const employeeId = req.params.employeeId;

  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const result = await ReportManagementService.getDipoMpoReportById(
    employeeId,
    { startDate, endDate },
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Dipo MPO report retrieved successfully",
    data: result,
  });
});

export const ReportManagementControllers = {
  geMpoTransectionReport,
  getMpoReportById,
  getAllMpoProgressReport,
  getGiftVoucherReport,
  getDipoMpoReport,
  getDipoMpoReportById,
};
