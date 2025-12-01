import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";
import { Category } from "./../../../../generated/prisma/client";

const createCategoryToDB = async (payLoad: Category) => {
  const category = await prisma.category.findFirst({
    where: {
      categoryName: payLoad.categoryName,
    },
  });

  if (category) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const result = await prisma.category.create({
    data: {
      categoryName: payLoad.categoryName,
    },
  });

  return result;
};

const getCategory = async (): Promise<Category[]> => {
  const result = await prisma.category.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return result;
};

const categoryUpdate = async (payLoad: Category) => {
  const category = await prisma.category.findFirst({
    where: {
      categoryName: payLoad.categoryName,
    },
  });

  if (category) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const result = await prisma.category.update({
    where: {
      id: payLoad.id,
    },
    data: {
      categoryName: payLoad.categoryName,
    },
  });

  return result;
};

const getCategorybyId = async (payLoad: Category) => {
  const result = await prisma.category.findFirstOrThrow({
    where: {
      categoryName: payLoad.categoryName,
    },
  });

  return result;
};

const deleteCategorybyId = async (id: number) => {
  const checkData = await prisma.category.findFirst({
    where: {
      id,
    },
  });
  if (!checkData) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No category found");
  }

  const result = await prisma.category.delete({
    where: {
      id: checkData.id,
    },
  });

  return result;
};

export const CagetoryService = {
  createCategoryToDB,
  getCategory,
  categoryUpdate,
  getCategorybyId,
  deleteCategorybyId,
};
