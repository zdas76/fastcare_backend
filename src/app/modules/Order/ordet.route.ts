import express from "express";
import { OrderControllers } from "./ordet.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const route = express.Router();

route.post(
  "/",
  auth(UserRole.ADMIN, UserRole.MPO),
  OrderControllers.createOrder
);

route.get("/", OrderControllers.getAllOrder);

route.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.MPO, UserRole.SR),
  OrderControllers.getOrderById
);

route.put(
  "/:id",
  auth(UserRole.ADMIN, UserRole.MPO),
  OrderControllers.UpdateOrderById
);

route.put(
  "/status/:orderNo",
  auth(UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.MPO, UserRole.SR),
  OrderControllers.changeOrderStatusByOrderNo
);

export const OrderRouter = route;
