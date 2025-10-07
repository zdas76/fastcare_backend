import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import config from "../../config";
import type { JwtPayload, Secret } from "jsonwebtoken";
import AppError from "../errors/AppError";
import { jwtHelpers } from "../helpers/jwt";
import prisma from "../shared/prisma";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const Bearertoken = req.headers.authorization;

      const token = Bearertoken?.split(" ");

      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorize");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token[1] as string,
        config.jwt.jwt_secret as Secret
      );

      const user = await prisma.user.findFirst({
        where: {
          employeeId: verifiedUser.employeeId,
        },
      });

      if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorize");
      }

      req.user = verifiedUser as JwtPayload;

      if (
        roles.length &&
        !verifiedUser.role.some((r: string) => roles.includes(r))
      ) {
        throw Error("Forbidden!");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
