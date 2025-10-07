import express from "express";
import { DepoControllers } from "./depo.controller";

const router = express.Router();

router.post("/", DepoControllers.AddDepo);

router.get("/", DepoControllers.getAllDepo);

router.get("/:id", DepoControllers.getDepoByid);

router.put("/:id", DepoControllers.UpdateDepoByid);

export const DepoRouter = router;
