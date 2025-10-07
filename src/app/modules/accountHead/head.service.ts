import type { AccountHead } from "@prisma/client";
import prisma from "../../shared/prisma";

const createHeadItemIntoDB = async (payLoad: AccountHead) => {
  const result = await prisma.accountHead.createMany({
    data: payLoad,
  });

  return result;
};

const getAllHeadItem = async () => {
  const result = await prisma.accountHead.findMany();

  return result;
};

export const AccountsHeadService = {
  createHeadItemIntoDB,
  getAllHeadItem,
};
