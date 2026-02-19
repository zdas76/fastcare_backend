
import express from "express";
import { MpoTargetController } from "./target.controller";

const router = express.Router();

router.post("/", MpoTargetController.createMPOTarget);
router.get("/", MpoTargetController.getMPOTarget);
router.get("/:id", MpoTargetController.getMPOTarget);
router.put("/:id", MpoTargetController.updateMPOTarget);
router.delete("/:id", MpoTargetController.deleteMPOTarget);

export const MpoTargetRouter = router;