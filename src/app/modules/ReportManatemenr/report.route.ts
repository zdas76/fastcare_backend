import express from "express";
import { ReportManagementControllers } from "./report.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../../generated/prisma";

const route = express.Router();

route.get("/mpo_report", ReportManagementControllers.geMpoTransectionReport);

route.get(
  "/mpo_report/:employeeId",
  ReportManagementControllers.getMpoReportById,
);

route.get(
  "/gift_voucher_report",
  ReportManagementControllers.getGiftVoucherReport,
);

route.get(
  "/dipo_mpo_report",
  ReportManagementControllers.getDipoMpoReport)

route.get(
  "/dipo_mpo_report/:employeeId",
  ReportManagementControllers.getDipoMpoReportById)

export const ReportManagementRouter = route;
