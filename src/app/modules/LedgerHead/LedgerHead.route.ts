import express from "express";
import { LedgerHeadController } from "./LedgerHead.controllers";

const router = express.Router();

router.post("/", LedgerHeadController.createAccountItem);

router.get("/", LedgerHeadController.getAccountItem);

router.get("/:id", LedgerHeadController.getAccountItemById);

router.put("/:id", LedgerHeadController.updateAccountItemById);

export const LedgerHeadRoute = router;
