import { StatusCodes } from "http-status-codes";
import type { SubCategory } from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";

const createSubCategoryToDB = async (payLoad: SubCategory) => {
  const subCategory = await prisma.subCategory.findFirst({
    where: {
      subCategoryName: payLoad.subCategoryName,
      categoryId: payLoad.categoryId,
    },
  });

  if (subCategory) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const result = await prisma.subCategory.create({
    data: {
      subCategoryName: payLoad.subCategoryName,
      categoryId: payLoad.categoryId,
    },
  });

  return result;
};

const getSubCategory = async (): Promise<SubCategory[] | SubCategory> => {
  const result = await prisma.subCategory.findMany({
    include: {
      category: {
        select: {
          categoryName: true,
        },
      },
    },

    orderBy: {
      categoryId: "asc",
    },
  });

  return result;
};

const subCategoryUpdate = async (payLoad: SubCategory) => {
  const checkId = await prisma.subCategory.findFirst({
    where: { id: payLoad.id },
  });

  if (!checkId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No data found");
  }

  const result = await prisma.subCategory.update({
    where: {
      id: payLoad.id,
    },
    data: {
      subCategoryName: payLoad.subCategoryName,
      categoryId: payLoad.categoryId,
    },
  });

  return result;
};

const getSubCategorybyId = async (payLoad: SubCategory) => {
  const subCategory = await prisma.subCategory.findFirst({
    where: {
      id: payLoad.id,
    },
  });

  if (!subCategory) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Name already used");
  }

  const result = await prisma.subCategory.findFirstOrThrow({
    where: {
      id: payLoad.id,
    },
  });

  return result;
};

const deleteSubCategorybyId = async (id: number) => {
  const checkData = await prisma.subCategory.findFirst({
    where: {
      id,
    },
  });

  if (!checkData) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No Sub-category found");
  }

  const result = await prisma.subCategory.delete({
    where: {
      id: checkData.id,
    },
  });

  return result;
};

export const SubCagetoryService = {
  createSubCategoryToDB,
  getSubCategory,
  subCategoryUpdate,
  getSubCategorybyId,
  deleteSubCategorybyId,
};
