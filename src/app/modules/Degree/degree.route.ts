import express from "express";
import { DegreeControllers } from "./degree.controllers";

const router = express.Router();

router.post("/", DegreeControllers.createDegree);

router.get("/", DegreeControllers.getDegree);

router.get("/:id", DegreeControllers.getDegreeById);

router.put("/:id", DegreeControllers.updateDegree);

router.delete("/:id", DegreeControllers.deleteDegreeById);

export const DegreeRouter = router;
