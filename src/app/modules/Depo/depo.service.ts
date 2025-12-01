import { StatusCodes } from "http-status-codes";
import { Depo } from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";

const createDepo = async (payload: Depo) => {
  const isExist = await prisma.depo.findFirst({
    where: {
      depoName: payload.depoName,
    },
  });

  if (isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This name already used");
  }

  const result = await prisma.depo.create({
    data: payload,
  });

  return result;
};

const getAllDepo = async () => {
  const result = await prisma.depo.findMany({});

  return result;
};

const getDepoById = async (id: number) => {
  const result = await prisma.depo.findFirst({
    where: { id: id },
  });

  return result;
};

const updateDepo = async (id: number, payload: Partial<Depo>) => {
  const isExist = await prisma.depo.findFirst({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Depo not found");
  }

  const result = await prisma.depo.update({
    where: { id: id },
    data: payload,
  });

  return result;
};

export const DepoService = {
  createDepo,
  getAllDepo,
  getDepoById,
  updateDepo,
};
