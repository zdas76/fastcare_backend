import type { Secret } from "jsonwebtoken";
import StatusCodes from "http-status-codes";
import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import config from "../../../config";
// import emailSender from "./emailSender";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";
import { jwtHelpers } from "../../helpers/jwt";

const loginUser = async (payLoad: { employeeId: string; password: string }) => {
  const userData = await prisma.user.findFirst({
    where: {
      employeeId: payLoad.employeeId,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) {
    throw new Error("EmployeeId or password not found");
  }
  const isCurrentPasword = await bcrypt.compare(
    payLoad.password,
    userData?.password as string
  );

  if (!isCurrentPasword) {
    throw new Error("Password incorrect!");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      employeeId: userData.employeeId,
      name: userData.name,
      email: userData.email,
      role: userData.roles,
      image: userData.photo,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      employeeId: userData.employeeId,
      name: userData.name,
      email: userData.email,
      role: userData.roles,
      image: userData.photo,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let userData;
  try {
    userData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (error) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Your are not Authorized");
  }

  const checkUser = await prisma.user.findUniqueOrThrow({
    where: {
      employeeId: userData.employeeId,
      name: userData.name,
      email: userData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!checkUser) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Your are not Authorized");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      employeeId: userData.employeeId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      image: userData.photo,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
  };
};

const changePassword = async (
  user: { employeeId: string; role: string; iat: number; exp: number },
  data: { olePassword: string; newPassword: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      employeeId: user.employeeId,
    },
  });
  const isCorrectPassword: boolean = await bcrypt.compare(
    data.olePassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Your are not Authorized");
  }
  const hassPassWord: string = await bcrypt.hash(
    data.newPassword,
    parseInt(config.jwt.hash_round as string)
  );

  await prisma.user.update({
    where: {
      employeeId: userData.employeeId,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hassPassWord,
    },
  });

  return {
    message: "Password Change Succesfully",
  };
};

const forgotPassword = async (playLoad: { employeeId: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      employeeId: playLoad.employeeId,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPasswordToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      employeeId: userData.employeeId,
      role: userData.roles,
    },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );
  //   const resetPassLink =
  //     config.reset_pass_link +
  //     `?email=${userData.email}&token=${resetPasswordToken}`;
  //   await emailSender(
  //     userData.email,
  //     `
  //     <p> Your password reset link
  //     <a href=${resetPassLink}>
  //       Reset Password
  //     </a>
  //     </p>
  //     `
  //   );
};

const resetPassword = async (
  token: string,
  payLoad: { employeeId: string; passWord: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      employeeId: payLoad.employeeId,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret
  );

  if (!isValidToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Your are not Authorized");
  }
  const hassPassWord: string = await bcrypt.hash(
    payLoad.passWord,
    parseInt(config.jwt.hash_round as string)
  );

  await prisma.user.update({
    where: {
      employeeId: userData.employeeId,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hassPassWord,
    },
  });
};

export const AuthService = {
  loginUser,
  refreshToken,
  forgotPassword,
  changePassword,
  resetPassword,
};
