import { StatusCodes } from "http-status-codes";
import type { Category, StakeholderDegree } from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";

const createDegreeToDB = async (payLoad: StakeholderDegree) => {
  const degree = await prisma.stakeholderDegree.findFirst({
    where: {
      degreeName: payLoad.degreeName,
    },
  });

  if (degree) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const result = await prisma.stakeholderDegree.create({
    data: payLoad,
  });

  return result;
};

const getDegrees = async (): Promise<StakeholderDegree[]> => {
  const result = await prisma.stakeholderDegree.findMany({
    where: {
      isDelete: false,
    },
    orderBy: {
      id: "asc",
    },
  });

  return result;
};

const updateDegree = async (id: number, payLoad: StakeholderDegree) => {
  const degree = await prisma.stakeholderDegree.findFirst({
    where: {
      id: id,
    },
  });

  if (degree) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Degree Name already");
  }

  const result = await prisma.stakeholderDegree.update({
    where: {
      id: id,
    },
    data: {
      degreeName: payLoad.degreeName,
      description: payLoad.description || "",
    },
  });

  return result;
};

const getDegreeybyId = async (id: number) => {
  const result = await prisma.stakeholderDegree.findFirstOrThrow({
    where: { id: id, isDelete: false },
  });

  return result;
};

const deleteDegreebyId = async (id: number) => {
  const checkData = await prisma.stakeholderDegree.findFirst({
    where: {
      id: id,
      isDelete: false,
    },
  });
  if (!checkData) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No degree found");
  }

  const result = await prisma.stakeholderDegree.update({
    where: {
      id: checkData.id,
    },
    data: {
      isDelete: true,
    },
  });

  return result;
};

export const DegreeService = {
  createDegreeToDB,
  getDegrees,
  updateDegree,
  getDegreeybyId,
  deleteDegreebyId,
};
