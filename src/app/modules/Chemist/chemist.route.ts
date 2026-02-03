import express, { NextFunction, Request, Response } from "express";
import { UserRole } from "../../../../generated/prisma";
import { resizeChemistImage } from "../../helpers/resizeChemistphoto";
import upload from "../../helpers/upload";
import auth from "../../middlewares/auth";
import { ChemistControllers } from "./chemist.controllers";

const route = express.Router();

route.post(
  "/",
  upload.single("photo"),
  resizeChemistImage,
  (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data); // parse string to object

    // Merge photo field if exists
    if (req.body.photo) {
      parsedData.photo = req.body.photo;
    }

    req.body = parsedData;

    return ChemistControllers.createChemist(req, res, next);
  },
);

route.get(
  "/",
  auth(
    UserRole.ACCOUNTS,
    UserRole.ADMIN,
    UserRole.SR,
    UserRole.MPO,
    UserRole.RSM,
  ),
  ChemistControllers.getAllChemist,
);

route.get("/:id", ChemistControllers.getChemistById);

route.put(
  "/:id",
  upload.single("photo"),
  resizeChemistImage,
  (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data);
    // Merge photo field if exists
    if (req.body.photo) {
      parsedData.photo = req.body.photo;
    }
    req.body = parsedData;
    return ChemistControllers.updateChemistById(req, res, next);
  },
);

route.delete("/:id", ChemistControllers.deleteChemistById);

export const ChemistRoute = route;
