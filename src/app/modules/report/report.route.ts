import express from "express";
import { ReportControllers } from "./report.controllers";

const route = express.Router();

route.get("/last_voucher/:vcode", ReportControllers.getLastVoucher);

route.get("/all_voucher", ReportControllers.getAllVoucher);

route.get("/voucher_report/:voucherNo", ReportControllers.getVoucherById);

route.get("/party_ledger", ReportControllers.getPartyReportById);

route.get("/chemist_ledger", ReportControllers.getChemistLedgerById);

route.get("/supplier_ledger", ReportControllers.getSuppliertLedgerById);

route.get("/account_head_ledger", ReportControllers.getAccountHeadLedgerById);

export const ReportRouter = route;
