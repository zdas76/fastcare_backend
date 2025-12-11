import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { Chemist, Prisma } from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import { generateId } from "../../helpers/generateId";
import { paginationHelper } from "../../helpers/pagination";
import { IPaginationOptions } from "../../interface/pagination";
import prisma from "../../shared/prisma";
import { PartySearchAbleFields } from "./chemist.constant";

const createChemist = async (req: Request) => {
  const payload = req.body;

  const isExistChemist = await prisma.chemist.findFirst({
    where: {
      pharmacyName: payload.pharmacyName,
      contactNo: payload.contactNo,
    },
  });

  if (isExistChemist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This User Already Exist");
  }

  const isExistDipo = await prisma.depo.findFirst({
    where: {
      id: payload.depoId,
      status: "ACTIVE",
    },
  });

  if (!isExistDipo) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Depo not found ");
  }

  const chemistId = await generateId("CMST", "chemist");

  payload.chemistId = chemistId;

  const addChemist = await prisma.$transaction(async (tx) => {
    const result = await tx.chemist.create({
      data: {
        chemistId: payload.chemistId,
        depoId: payload.depoId,
        pharmacyName: payload.pharmacyName,
        contactPerson: payload.contactPerson,
        contactNo: payload.contactNo,
        address: payload.address,
        discountRate: payload.discountRate,
        photo: payload.photo || null,
      },
    });

    return result;
  });

  return addChemist;
};

const getAllChemist = async (params: any, paginat: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.Pagination(paginat);

  const { searchTerm, ...filterData } = params;

  const andCondition: Prisma.ChemistWhereInput[] = [{ isDeleted: false }];

  if (params.searchTerm) {
    andCondition.push({
      OR: PartySearchAbleFields.map((field) => ({
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

  const wehreConditions: Prisma.ChemistWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.chemist.findMany({
    where: wehreConditions,
    // skip,
    // take: limit,
    orderBy:
      paginat.sortBy && paginat.sortOrder
        ? {
            [paginat.sortBy]: paginat.sortOrder,
          }
        : {
            pharmacyName: "asc",
          },
  });

  return result;
};

const getChemistById = async (id: number) => {
  const result = await prisma.chemist.findFirst({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  return result;
};

const updateChemistById = async (id: number, payload: Partial<Chemist>) => {
  const isExist = await prisma.chemist.findFirst({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No Chemis Found ");
  }

  const result = await prisma.chemist.update({
    where: {
      id: id,
    },
    data: payload,
  });

  return result;
};

const deleteChemistById = async (id: number) => {
  const isExist = await prisma.chemist.findFirst({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No Chemis found");
  }

  const result = await prisma.chemist.update({
    where: {
      id: id,
    },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const ChemistService = {
  createChemist,
  getAllChemist,
  getChemistById,
  updateChemistById,
  deleteChemistById,
};
