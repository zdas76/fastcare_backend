import { UserControllers } from "./user.controllers";
import express, { NextFunction, Request, Response } from "express";
import { userValidaton } from "./user.validation";
import upload from "../../helpers/upload";
import { resizeUserImage } from "../../helpers/resizeUserphoto";
const route = express.Router();

route.post(
  "/",
  upload.single("photo"),
  resizeUserImage,
  (req: Request, res: Response, next: NextFunction) => {
    const parsedData = JSON.parse(req.body.data);
    if (req.body.photo) {
      parsedData.photo = req.body.photo;
    }
    req.body = parsedData;
    return UserControllers.createUser(req, res, next);
  }
);

route.get("/", UserControllers.getUser);

route.get("/:id", UserControllers.getUserById);

route.put(
  "/:id",
  upload.single("photo"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidaton.updateEmployee.parse(JSON.parse(req.body.data));

    return UserControllers.updateUserById(req, res, next);
  }
);

route.delete("/:id", UserControllers.deleteUserById);

export const UserRoute = route;
