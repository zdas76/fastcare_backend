import { InventoryControllers } from "./inventories.controllers";
import express from "express";

const route = express.Router();

route.get("/", InventoryControllers.getInventory);

route.get("/inventorytotal", InventoryControllers.getInventoryTotal);

route.get("/:productId", InventoryControllers.getInventoryById);

route.put("/:id", InventoryControllers.updateInventory);

route.delete("/:id", InventoryControllers.deleteInventory);

export const InventoryRoute = route;
