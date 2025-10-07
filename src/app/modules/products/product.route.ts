import express from "express";
import { ProductControllers } from "./product.controllers";
import validationRequiest from "../../middlewares/validationRequest";

const route = express.Router();

route.post("/", ProductControllers.createProduct);

route.get("/:id", ProductControllers.getProductById);

route.get("/", ProductControllers.getAllProduct);

route.put("/:id", ProductControllers.updateProductById);

route.delete("/:id", ProductControllers.deleteProductById);

export const ProductRoute = route;
