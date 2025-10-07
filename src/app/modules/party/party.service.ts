import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { Party, PartyType } from "@prisma/client";

const createParty = async (payload: Party) => {
  const isExisted = await prisma.party.findFirst({
    where: {
      partyName: payload.partyName,
      contactNo: payload.contactNo,
    },
  });

  if (isExisted) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This name or contact already exised"
    );
  }
  const result = await prisma.party.create({
    data: payload,
  });

  return result;
};

const getAllParty = async (partytype: string) => {
  const result = await prisma.party.findMany({
    where: partytype ? { partytype: partytype as PartyType } : {},
  });
  return result;
};

const updatePartyById = async (id: number, payload: Partial<Party>) => {
  const isExisted = await prisma.party.findFirst({
    where: {
      id,
    },
  });

  if (!isExisted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Supplier not found");
  }

  const result = await prisma.party.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const getPartyById = async (id: number) => {
  const result = await prisma.party.findMany({
    where: {
      id,
    },
  });
  return result;
};

export const PartyService = {
  createParty,
  getAllParty,
  getPartyById,
  updatePartyById,
};
