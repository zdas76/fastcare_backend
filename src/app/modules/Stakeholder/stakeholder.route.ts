import express from "express";
import { StakholderControllers } from "./stakeholder.controllers";

const router = express.Router();

router.post("/", StakholderControllers.createStakholder);

router.get("/", StakholderControllers.getStakholder);

router.get("/:id", StakholderControllers.getStakholderById);

router.put("/", StakholderControllers.updateStakholder);

router.delete("/:id", StakholderControllers.deleteStakholderById);

export const StakeholderRoute = router;
