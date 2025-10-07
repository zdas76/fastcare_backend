import express from "express";
import { ScopeControllers } from "./scope.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const route = express.Router();

route.post(
  "/",
  auth(UserRole.ADMIN, UserRole.ACCOUNTS),
  ScopeControllers.createScope
);

route.get("/", ScopeControllers.getAllScope);

export const scopeRoute = route;
