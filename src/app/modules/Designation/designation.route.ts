import express from "express";
import { DesignationControllers } from "./designation.controllers";

const router = express.Router();

router.post("/", DesignationControllers.createDesignation);

router.get("/", DesignationControllers.getDesignation);

router.get("/:id", DesignationControllers.getDesignationById);

router.put("/", DesignationControllers.updateDesignation);

router.delete("/:id", DesignationControllers.deleteDesignationById);

export const DesignationRouter = router;
