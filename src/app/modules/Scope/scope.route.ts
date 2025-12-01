import express from "express";
import { UserRole } from "../../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import { ScopeControllers } from "./scope.controllers";

const route = express.Router();

route.post(
  "/",
  auth(UserRole.ADMIN, UserRole.ACCOUNTS),
  ScopeControllers.createScope
);

route.get("/", ScopeControllers.getAllScope);

export const scopeRoute = route;
