import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { TcreateProduct } from "./product.type";
import prisma from "../../shared/prisma";
import { Product, Status } from "@prisma/client";

const createProduct = async (payload: TcreateProduct) => {
  const isExist = await prisma.product.findFirst({
    where: {
      name: payload.name,
      status: Status.ACTIVE,
    },
  });

  if (isExist) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This product is already existed"
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name: payload.name,
        description: payload.description,
        unitId: payload.unitId,
        subCategoryId: payload.subCategoryId,
        mrp: payload.mrp || 0,
        tp: payload.tp || 0,
        size: payload.size || "",
        balance: payload.initialStock.amount,
        quantity: payload.initialStock.quantity,
        unitPrice: payload.initialStock.unitPrice,
        date: new Date(payload.initialStock.date),
      },
    });

    await tx.inventory.create({
      data: {
        productId: newProduct?.id,
        depoId: payload.initialStock.depoId,
        unitPrice: payload.initialStock.unitPrice,
        date: new Date(payload.initialStock.date),
        quantityAdd: payload.initialStock.quantity,
        debitAmount: payload.initialStock.amount,
        isClosing: true,
      },
    });
  });

  return result;
};

const gerProduct = async () => {
  const result = await prisma.product.findMany({
    where: {
      status: Status.ACTIVE,
    },

    orderBy: {
      id: "desc",
    },
    include: {
      subCategory: true,
      unit: true,
    },
  });

  return result;
};

const gerProductById = async (id: number) => {
  const result = await prisma.product.findFirst({
    where: {
      id: id,
      status: Status.ACTIVE,
    },
  });

  return result;
};

const updateProductById = async (id: number, payload: Partial<Product>) => {
  const isExist = await prisma.product.findFirst({
    where: { id: id, status: Status.ACTIVE },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No product found");
  }

  const updateData: Record<string, any> = {};
  if (payload?.name !== undefined) updateData.name = payload.name;
  if (payload?.description !== undefined)
    updateData.description = payload.description;
  if (payload?.unitId !== undefined) updateData.unitId = payload.unitId;
  if (payload?.subCategoryId !== undefined)
    updateData.subCategoryId = payload.subCategoryId;
  if (payload?.mrp !== undefined) updateData.mrp = payload.mrp;
  if (payload?.tp !== undefined) updateData.tp = payload.tp;
  if (payload?.size !== undefined) updateData.size = payload.size;

  const result = await prisma.product.update({
    where: {
      id: id,
    },
    data: updateData,
  });

  return result;
};

const deleteProductById = async (id: number) => {
  const isExist = await prisma.product.findFirst({
    where: { id: id },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No product found");
  }

  const result = await prisma.product.update({
    where: {
      id: id,
    },
    data: {
      status: Status.DELETED,
    },
  });

  return result;
};

export const ProductService = {
  createProduct,
  gerProduct,
  gerProductById,
  updateProductById,
  deleteProductById,
};
