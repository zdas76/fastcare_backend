import express from "express";
import { ReportManagementControllers } from "./report.controllers";

const route = express.Router();

route.get("/mpo_report", ReportManagementControllers.geMpoTransectionReport);

route.get(
  "/mpo_report/:employeeId",
  ReportManagementControllers.getMpoReportById,
);

export const ReportManagementRouter = route;
