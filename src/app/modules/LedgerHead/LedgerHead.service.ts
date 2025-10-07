import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";
import { LedgerHead } from "@prisma/client";

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

  const isExistLedgerCode = await prisma.ledgerHead.findFirst({
    where: {
      headCodeId: payLoad.headCodeId,
      ledgerCode: payLoad.ledgerCode,
    },
  });

  if (isExistLedgerCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `This ${payLoad.ledgerCode} Code already existed`
    );
  }

  const result = await prisma.ledgerHead.update({
    where: { id },
    data: payLoad,
  });
  return result;
};

export const LedgerHeadService = {
  createAccountsItemtoDB,
  getAccountsItemFromDB,
  getAccountsItemByIdFromDB,
  updateAccountsItemFromDBbyId,
};
