import express from "express";
import { InventoryControllers } from "./inventories.controllers";

const route = express.Router();

route.get("/", InventoryControllers.getInventory);

route.get("/inventorytotal", InventoryControllers.getInventoryTotal);

route.get("/:productId", InventoryControllers.getInventoryById);

route.get("/:voucherNo", InventoryControllers.getInventoryByVoucherNo);

route.put("/:id", InventoryControllers.updateInventory);

route.delete("/:id", InventoryControllers.deleteInventory);

export const InventoryRoute = route;
