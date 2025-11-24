import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { JournalControllers } from "./journal.controllers";

const route = express.Router();

route.post("/purchase", JournalControllers.addPurcherReceived);

route.post("/allocation", JournalControllers.productTransferInvontory);

route.post("/sales", JournalControllers.createSalseVoucher);

route.post("/received", JournalControllers.createReceiptVoucher);

route.post("/payment", JournalControllers.createPaymentdVoucher);

route.post("/journal", JournalControllers.createJournalVoucher);

route.post("/contra", JournalControllers.addPurcherReceived);

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
