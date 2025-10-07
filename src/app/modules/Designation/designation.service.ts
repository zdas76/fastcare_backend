import { StatusCodes } from "http-status-codes";
import type { StakeholderDeisgnation } from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";

const createDesignation = async (payLoad: StakeholderDeisgnation) => {
  const Designation = await prisma.stakeholderDeisgnation.findFirst({
    where: {
      designation: payLoad.designation,
    },
  });

  if (Designation) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const result = await prisma.stakeholderDeisgnation.create({
    data: payLoad,
  });

  return result;
};

const getDesignation = async (): Promise<StakeholderDeisgnation[]> => {
  const result = await prisma.stakeholderDeisgnation.findMany({
    where: {
      isDelete: false,
    },
    orderBy: {
      id: "asc",
    },
  });

  return result;
};

const updateDesignation = async (payLoad: StakeholderDeisgnation) => {
  const category = await prisma.stakeholderDeisgnation.findFirst({
    where: {
      designation: payLoad.designation,
      isDelete: false,
    },
  });

  if (category) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const result = await prisma.stakeholderDeisgnation.update({
    where: {
      id: payLoad.id,
    },
    data: {
      designation: payLoad.designation,
    },
  });

  return result;
};

const getDesignationbyId = async (id: number) => {
  const result = await prisma.stakeholderDeisgnation.findFirstOrThrow({
    where: {
      id,
      isDelete: false,
    },
  });

  return result;
};

const deleteDesignationbyId = async (id: number) => {
  const checkData = await prisma.stakeholderDeisgnation.findFirst({
    where: {
      id,
    },
  });
  if (!checkData) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No category found");
  }

  const result = await prisma.stakeholderDeisgnation.update({
    where: {
      id: checkData.id,
    },
    data: {
      isDelete: true,
    },
  });

  return result;
};

export const DesignationService = {
  createDesignation,
  getDesignation,
  updateDesignation,
  getDesignationbyId,
  deleteDesignationbyId,
};
