import { StatusCodes } from "http-status-codes";
import { LedgerHead } from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";

const createAccountsItemtoDB = async (payLoad: LedgerHead) => {
  const isExist = await prisma.ledgerHead.findFirst({
    where: {
      ledgerCode: payLoad.ledgerCode,
      headCodeId: payLoad.headCodeId,
    },
  });

  if (isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This item already exist");
  }

  const result = await prisma.ledgerHead.create({
    data: payLoad,
  });

  return result;
};

const getAccountsItemFromDB = async (payLoad: string) => {
  let filerValue = {};

  // if (payLoad) {
  //   const filer = JSON.parse(payLoad).map((code: string) => {
  //     return { accountHeadcode: id };
  //   });

  //   filerValue = {
  //     OR: filer,
  //   };
  // }

  const result = await prisma.ledgerHead.findMany({
    // where: filerValue,
    orderBy: {
      headCodeId: "asc",
    },
    include: {
      accountHead: true,
    },
  });
  return result;
};

const getAccountsItemByIdFromDB = async (id: number) => {
  const result = await prisma.ledgerHead.findFirst({
    where: { id },
  });
  return result;
};

const updateAccountsItemFromDBbyId = async (
  id: number,
  payLoad: LedgerHead
) => {
  const isExist = await prisma.ledgerHead.findFirst({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This item not found");
  }

  const result = await prisma.ledgerHead.update({
    where: { id },
    data: {
      ledgerName: payLoad.ledgerName,
    },
  });
  return result;
};

export const LedgerHeadService = {
  createAccountsItemtoDB,
  getAccountsItemFromDB,
  getAccountsItemByIdFromDB,
  updateAccountsItemFromDBbyId,
};
