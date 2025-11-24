import { Prisma, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";
import AppError from "../../errors/AppError";
import { generateId } from "../../helpers/generateId";
import { paginationHelper } from "../../helpers/pagination";
import { IPaginationOptions } from "../../interface/pagination";
import prisma from "../../shared/prisma";
import { UserSearchAbleFields } from "./user.constant";
import { User } from "./user.validation";

const creatUserToDB = async (payload: User) => {
  const hashedPassword = bcrypt.hashSync(
    payload.password,
    parseInt(config.jwt.hash_round as any)
  );

  const employeeId = await generateId("FCDE", "user");

  if (!employeeId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Create Employee only");
  }

  const createEmployee = await prisma.user.create({
    data: {
      employeeId: employeeId,
      name: payload.name,
      password: hashedPassword,
      email: payload.email,
      roles: payload.role,
      photo: payload.photo,
      employeeProfile: {
        create: {
          fatherName: payload.fatherName,
          motherName: payload.motherName,
          officeContactNo: payload.officeContactNo,
          currentAddress: payload.currentAddress,
          permanentAddress: payload.permanentAddress,
          nid: payload.nid,
          dob: new Date(payload.dob),
          contactNo: payload.contactNo,
          emergencyContactNo: payload.emergencyContactNo,
        },
      },
    },
    include: {
      employeeProfile: true,
    },
  });
  return createEmployee;
};

const getAllUser = async (params: any, paginat: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.Pagination(paginat);

  const { searchTerm, ...filterData } = params;

  const andCondition: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andCondition.push({
      OR: UserSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const wehreConditions: Prisma.UserWhereInput =
    andCondition.length > 0
      ? { AND: andCondition }
      : { status: UserStatus.ACTIVE };

  const result = await prisma.user.findMany({
    where: wehreConditions,
    skip,
    take: limit,
    orderBy:
      paginat.sortBy && paginat.sortOrder
        ? {
            [paginat.sortBy]: paginat.sortOrder,
          }
        : {
            createdAt: "asc",
          },
    select: {
      id: true,
      name: true,
      employeeId: true,
      email: true,
      photo: true,
      status: true,
      roles: true,
      employeeProfile: true,
    },
  });

  const total = await prisma.user.count({
    where: wehreConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getUserById = async (id: number) => {
  const result = await prisma.user.findFirst({
    where: {
      id: id,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      name: true,
      employeeId: true,
      email: true,
      photo: true,
      status: true,
      roles: true,
      employeeProfile: true,
    },
  });

  return result;
};

const updateUserById = async (id: number, payload: Partial<User>) => {
  const result = await prisma.user.update({
    where: {
      id: id,
      status: UserStatus.ACTIVE,
    },
    data: {
      name: payload.name || undefined,
      email: payload.email || undefined,
      password: payload.password || undefined,
      photo: payload.photo || undefined,
      roles: payload.role || undefined,
      employeeProfile: {
        update: {
          fatherName: payload.fatherName || undefined,
          motherName: payload.motherName || undefined,
          officeContactNo: payload.officeContactNo || undefined,
          currentAddress: payload.currentAddress || undefined,
          permanentAddress: payload.permanentAddress || undefined,
          nid: payload.nid || undefined,
          dob: payload.dob ? new Date(payload.dob) : undefined,
          contactNo: payload.contactNo || undefined,
          emergencyContactNo: payload.emergencyContactNo || undefined,
        },
      },
    },
  });

  return result;
};

const deleteUserById = async (id: number) => {
  const result = await prisma.user.update({
    where: {
      id: id,
      status: UserStatus.ACTIVE,
    },
    data: {
      status: UserStatus.DELETED,
    },
  });

  return result;
};

export const UserService = {
  creatUserToDB,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
