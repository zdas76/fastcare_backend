import express from "express";
import { InventoryProgressController } from "./inventoryProgress.controllers";

const route = express.Router();


route.get("/", InventoryProgressController.getInventoryProgressByMPO)

route.get("/product_by_depo", InventoryProgressController.gerProductProgressByDepo)

route.get("/:employeeId", InventoryProgressController.getInventoryProgressByMPOId)


export const InventoryProgressRoute = route;

