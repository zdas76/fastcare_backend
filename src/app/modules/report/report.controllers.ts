import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReportService } from "./report.service";

const getLastVoucher = catchAsync(async (req, res) => {
  const vcode = req.params.vcode as string;

  const result = await ReportService.getLastVoucherNumber(vcode);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Last voucher No. retrived Successfully",
    data: result,
  });
});

const getAllVoucher = catchAsync(async (req, res) => {
  const result = await ReportService.getAllVoucher();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All Vouchers. retrived Successfully",
    data: result,
  });
});

const getVoucherById = catchAsync(async (req, res) => {
  const voucherNo = req.params.voucherNo as string;

  const result = await ReportService.getReportByVoucherNo(voucherNo);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vouchers retrived Successfully by Voucher No.",
    data: result,
  });
});

const getPartyReportById = catchAsync(async (req, res) => {
  const result = await ReportService.getpartyLadgertoBdById(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "LedgerInfo retrived Successfully",
    data: result,
  });
});

const getChemistLedgerById = catchAsync(async (req, res) => {
  const result = await ReportService.getChemistLedgerById(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Chemist Info retrived Successfully by ChemistId.",
    data: result,
  });
});

const getSuppliertLedgerById = catchAsync(async (req, res) => {
  const result = await ReportService.getSupplierLedgerById(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Suppliers Info retrived Successfully by ChemistId.",
    data: result,
  });
});

export const ReportControllers = {
  getLastVoucher,
  getAllVoucher,
  getVoucherById,
  getPartyReportById,
  getChemistLedgerById,
  getSuppliertLedgerById,
};
