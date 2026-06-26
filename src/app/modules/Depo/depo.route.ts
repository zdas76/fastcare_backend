import express from "express";

import { DepoControllers } from "./depo.controller";
import { UserRole } from "../../../../generated/prisma";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/", DepoControllers.AddDepo);

router.get("/", auth(UserRole.ADMIN, UserRole.MPO, UserRole.ACCOUNTS, UserRole.SR, UserRole.RSM), DepoControllers.getAllDepo);

router.get("/:id", DepoControllers.getDepoByid);

router.put("/:id", DepoControllers.UpdateDepoByid);

export const DepoRouter = router;
