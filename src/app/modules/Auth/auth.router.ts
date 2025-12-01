import express from "express";
import { UserRole } from "../../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import { AuthControllers } from "./auth.controllers";

const router = express.Router();

router.post("/login", AuthControllers.loginUser);

router.post("/refresh-token", AuthControllers.refreshToken);

router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AuthControllers.changePassword
);

router.post("/forgot-password", AuthControllers.forgotPassword);

router.post("/reset-password", AuthControllers.resetPassword);

export const AuthRoutes = router;
