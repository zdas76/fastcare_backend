import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { generateId } from "../../helpers/generateId";
import prisma from "../../shared/prisma";
import { TStakeholders } from "./stakeholder";

const createStakeholderToDB = async (payLoad: TStakeholders) => {
  const stakeholder = await prisma.stakeholder.findFirst({
    where: {
      name: payLoad.name,
    },
  });

  if (stakeholder) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const stakeId = await generateId("STK", "stakeholder");

  if (!stakeId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Id not found");
  }

  const result = await prisma.stakeholder.create({
    data: {
      stakeId: stakeId,
      name: payLoad.name,
      designationId: payLoad.designationId,
      degreeId: payLoad.degreeId,
      category: payLoad.category,
      officeAddress: payLoad.officeAddress,
      contactNo: payLoad.contactNo,
      honorary: payLoad.honorary,
      paymentDate: new Date(payLoad.paymentDate),
      rxCommitment: payLoad.rxCommitment,
      product: {
        connect: payLoad.rxProducts.map((id) => ({ id })),
      },
    },
  });

  return result;
};

const getStakeholder = async () => {
  const result = await prisma.stakeholder.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      stakeId: true,
      name: true,
      stakeholderDeisgnation: true,
      stakeholderDegree: true,
      category: true,
      officeAddress: true,
      contactNo: true,
      honorary: true,
      paymentDate: true,
      rxCommitment: true,
      product: true,
    },
  });

  return result;
};

const updateStakeholder = async (payLoad: TStakeholders) => {
  const Stakeholder = await prisma.stakeholder.findFirst({
    where: {
      name: payLoad.name,
    },
  });

  if (Stakeholder) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const result = await prisma.stakeholder.update({
    where: {
      id: payLoad.id,
    },
    data: {
      name: payLoad.name,
    },
  });

  return result;
};

const getStakeholderbyId = async (payLoad: TStakeholders) => {
  const result = await prisma.stakeholder.findFirstOrThrow({
    where: {
      stakeId: payLoad.stakeId,
    },
  });

  return result;
};

const deleteStakeholderbyId = async (id: number) => {
  const checkData = await prisma.stakeholder.findFirst({
    where: {
      id,
    },
  });
  if (!checkData) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No category found");
  }

  const result = await prisma.stakeholder.delete({
    where: {
      id: checkData.id,
    },
  });

  return result;
};

export const StakeholderService = {
  createStakeholderToDB,
  getStakeholder,
  updateStakeholder,
  getStakeholderbyId,
  deleteStakeholderbyId,
};
