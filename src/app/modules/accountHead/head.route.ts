import express from "express";
import { AccountHeadControllers } from "./head.controllers";

const router = express.Router();

router.post("/", AccountHeadControllers.createAccountsHead);

router.get("/", AccountHeadControllers.getAccountHead);

export const AccountHeadRoute = router;
