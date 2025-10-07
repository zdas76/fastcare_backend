import express from "express";
import { UnitControllers } from "./unit.controllers";

const route = express.Router();

route.post("/", UnitControllers.createUnit);

route.get("/", UnitControllers.getAllUnit);

route.get("/:id", UnitControllers.getUnitById);

route.put("/", UnitControllers.updateUnit);

route.delete("/:id", UnitControllers.deleteUnit);

export const UnitRoute = route;
