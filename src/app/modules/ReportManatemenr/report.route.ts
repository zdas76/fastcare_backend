import express from "express";
import { ReportManagementControllers } from "./report.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../../generated/prisma";

const route = express.Router();

route.get("/mpo_report", ReportManagementControllers.geMpoTransectionReport);

route.get(
  "/mpo_progress_report", auth(UserRole.ADMIN, UserRole.RSM, UserRole.ACCOUNTS),
  ReportManagementControllers.getAllMpoProgressReport,
);

route.get(
  "/mpo_report/:employeeId",
  ReportManagementControllers.getMpoReportById,
);

export const ReportManagementRouter = route;
