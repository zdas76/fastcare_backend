import express from "express";
import { UserRole } from "../../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import { JournalControllers } from "./journal.controllers";

const route = express.Router();

route.post("/purchase", JournalControllers.addPurcherReceived);

route.post("/allocation", JournalControllers.productTransferInvontory);

route.post(
  "/sales",
  auth(UserRole.ACCOUNTS, UserRole.ADMIN),
  JournalControllers.createSalseVoucher
);

route.post(
  "/wholesales",
  auth(UserRole.ADMIN),
  JournalControllers.createWholeSalseVoucher
);

route.post(
  "/sales_return_by_sr",
  auth(UserRole.SR, UserRole.ADMIN),
  JournalControllers.createSalseReturnVoucherBySR
);

route.post(
  "/sales_return_by_office",
  auth(UserRole.ACCOUNTS, UserRole.ADMIN),
  JournalControllers.createSalseReturnVoucherByOffice
);

route.post("/received", JournalControllers.createReceiptVoucher);

route.post("/payment", JournalControllers.createPaymentdVoucher);

route.post("/journal", JournalControllers.createJournalVoucher);

route.post("/contra", JournalControllers.addPurcherReceived);

route.post("/gift", JournalControllers.createGiftVoucher);

route.post(
  "/fixed",
  auth(UserRole.ADMIN),
  JournalControllers.createFixedJournalVoucher
);

route.post(
  "/money_received",
  auth(UserRole.ADMIN, UserRole.SR),
  JournalControllers.createMoneyRecivedVoucher
);

// route.put("/");

// route.delete("/");

export const JournalRoute = route;
