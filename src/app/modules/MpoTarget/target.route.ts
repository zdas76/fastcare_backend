
import express from "express";
import { MpoTargetController } from "./target.controller";
import { UserRole } from "../../../../generated/prisma";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/", MpoTargetController.createMPOTarget);
router.get("/", MpoTargetController.getMPOTarget);
router.put("/:id", MpoTargetController.updateMPOTarget);
router.delete("/:id", MpoTargetController.deleteMPOTarget);
router.get(
    "/mpo_progress_report", auth(UserRole.ADMIN, UserRole.RSM, UserRole.ACCOUNTS),
    MpoTargetController.getAllMpoProgressReport,
);
router.get(
    "/mpo_progress_report/:employeeId", auth(UserRole.ADMIN, UserRole.MPO),
    MpoTargetController.getAllMpoProgressReportById,
);

router.get("/:id", MpoTargetController.getMPOTarget);

export const MpoTargetRouter = router;