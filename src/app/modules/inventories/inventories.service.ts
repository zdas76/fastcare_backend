import { StatusCodes } from "http-status-codes";
import { Inventory, Product } from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";

const getInventory = async (
  depoId: number | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
) => {
  if (depoId) {
    const result = await prisma.$queryRaw<
      {
        productId: number;
        productName: string;
        depoId: number;
        depoName: string;
        netQuantity: number;
        netAmount: number;
      }[]
    >`
  SELECT 
    i.productId,
    p.name AS productName,
    i.depoId,
    d.depoName,
    SUM(COALESCE(i.quantityAdd, 0) - COALESCE(i.quantityLess, 0)) AS netQuantity,
    SUM(COALESCE(i.debitAmount, 0) - COALESCE(i.creditAmount, 0)) AS netAmount
  FROM inventories i
  JOIN products p ON p.id = i.productId
  JOIN depos d ON d.id = i.depoId
  WHERE (${depoId} IS NULL OR i.depoId = ${depoId})
    AND (${startDate} IS NULL OR i.date >= ${startDate})
    AND (${endDate} IS NULL OR i.date <= ${endDate})
    AND i.date >= p.date
  GROUP BY i.productId, p.name, i.depoId, d.depoName
  ORDER BY i.productId ASC
`;

    return result;
  }
};

const getInventoryById = async (
  productId: number,
  depoId: number,
  startDate: Date | null,
  endDate: Date | null,
) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
    },
    select: {
      name: true,
      tp: true,
      size: true,
      date: true,
    },
  });

  if (!product) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Product not found");
  }
  const newStartDate = startDate ? startDate : product.date;
  const newEndDate = endDate ? endDate : new Date();

  const result = await prisma.inventory.findMany({
    where: {
      productId,
      depoId,
      employeeId: null,
      date: {
        gte: new Date(newStartDate),
        lte: new Date(newEndDate),
      },
    },
    orderBy: [{ date: "asc" }, { id: "asc" }],
    include: {
      depo: { select: { depoName: true } },
      transactionInfo: {
        select: {
          id: true,
          voucherNo: true,
          voucherType: true,
          date: true,
          party: {
            select: {
              partyName: true,
            },
          },
          chemist: {
            select: {
              pharmacyName: true,
            },
          },
        },
      },
    },
  });
  return { product, result };
};

const getInventoryTotalById = async (query: {
  productId: number;
  depoId: number;
}) => {
  const productId = Number(query.productId);
  const depoId = Number(query.depoId);

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Product not found");
  }

  const depo = await prisma.depo.findUnique({
    where: {
      id: depoId,
    },
  });

  if (!depo) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Depo not found");
  }

  const InvenotyTotal = await prisma.inventory.aggregate({
    _sum: {
      quantityAdd: true,
      quantityLess: true,
      debitAmount: true,
      creditAmount: true,
    },
    where: {
      productId: productId,
      depoId: depoId,
    },
  });

  console.log("InvenotyTotal", InvenotyTotal);
  const netQuantity =
    (InvenotyTotal._sum.quantityAdd || 0) -
    (InvenotyTotal._sum.quantityLess || 0);
  const netAmount =
    (InvenotyTotal._sum.debitAmount || 0) -
    (InvenotyTotal._sum.creditAmount || 0);

  return { netQuantity, netAmount };
};

const getDepoInventoryTotalById = async (query: any) => {
  const product = await prisma.product.findFirst({
    where: {
      id: query.productId,
    },
  });
  const result = await prisma.$queryRaw`
  SELECT 
    i.productId,
    i.depoId,
    SUM(IFNULL(i.quantityAdd, 0) - IFNULL(i.quantityLess, 0)) AS netQuantity,
    SUM(IFNULL(j.debitAmount, 0)- IFNULL(j.creditAmount, 0)) AS netAmount
    
  FROM inventories i
  LEFT JOIN journals j ON j.inventoryItemId = i.id
  WHERE i.productId = ${query.productId} AND i.date=${product?.date}
  GROUP BY i.productId, i.depoId`;

  return result;
};

const updateInventory = async (id: number, payload: Inventory) => {
  return await prisma.inventory.updateMany({
    where: {},
    data: {},
  });
};

const deleteInventory = async (id: number) => {
  return console.log("first");
};

const getInventoryByVoucherNo = async (voucherNo: string) => {
  const result = await prisma.inventory.findMany({
    where: {
      transactionInfo: { voucherNo },
    },
    include: {
      transactionInfo: {
        select: { voucherNo: true, voucherType: true },
      },
    },
  });
  return result;
};

const inventoryProduct = async (employeeId: string, depoId: number) => {
  const result = await prisma.product.findMany({
    where: {
      inventory: {
        some: {
          employeeId: employeeId || undefined,
          depoId: depoId || undefined,
        },
      },
    },
  });
  return result;
};

export const InventoryService = {
  getInventory,
  getInventoryById,
  getInventoryTotalById,
  getDepoInventoryTotalById,
  getInventoryByVoucherNo,
  updateInventory,
  deleteInventory,
  inventoryProduct,
};

async function productIsExist(data: object) {
  return await prisma.product.findFirst({
    where: data,
  });
}
