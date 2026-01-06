import { StatusCodes } from "http-status-codes";
import { OrdStatus, Prisma } from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";

import { generateVoucherNumber } from "../../helpers/createVoucherNo";

const createOrder = async (payload: any, user: any) => {
  const isUser = await prisma.user.findFirst({
    where: {
      employeeId: user.employeeId,
    },
  });

  if (!isUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Not Found");
  }

  const orderNo = await generateVoucherNumber("ODR");

  if (!orderNo) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to generate order number"
    );
  }

  const addOrder = await prisma.$transaction(async (tx) => {
    const orderinfo = await tx.order.create({
      data: {
        employeeId: isUser.employeeId,
        chemistId: payload.chemistId,
        orderNo: orderNo,
        date: new Date(),
        discount: payload.discount | 0,
        orderStatus: {
          create: {},
        },
      },
    });

    await Promise.all(
      payload.productItem.map((item: any) =>
        tx.orderItem.create({
          data: {
            orderId: orderinfo.id,
            productId: item.productId,
            quintity: item.quantity,
            tpRate: item.unitPrice,
            amount: item.amount,
          },
        })
      )
    );

    return orderinfo;
  });

  const result = await prisma.order.findFirst({
    where: {
      orderNo: addOrder.orderNo,
    },
    include: {
      orderItem: true,
      orderStatus: true,
    },
  });

  return result;
};

const getAllOrder = async (
  status?: string,
  startDate?: string,
  endDate?: string
) => {
  const where: Prisma.OrderWhereInput = {};

  if (status) {
    // Convert CSV string to array and filter valid enum values
    const statusArray = status
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is keyof typeof OrdStatus => s in OrdStatus);

    if (statusArray.length > 0) {
      where.orderStatus = {
        some: {
          OR: statusArray.map((s) => ({ status: OrdStatus[s] })),
        },
      };
    }
  }
  // Handle date filters
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const result = await prisma.order.findMany({
    where,
    include: {
      orderItem: {
        select: {
          id: true,
          amount: true,
          quintity: true,
          tpRate: true,
          productId: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
      orderStatus: {
        select: {
          id: true,
          status: true,
          dateTime: true,
          comments: true,
        },
      },
      chemist: {
        select: {
          id: true,
          pharmacyName: true,
          contactPerson: true,
          depoId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return result;
};

const getOrderById = async (id: number) => {
  const result = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      orderItem: {
        select: {
          id: true,
          amount: true,
          quintity: true,
          tpRate: true,
          productId: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
      orderStatus: {
        select: {
          id: true,
          status: true,
          dateTime: true,
          comments: true,
        },
      },
      chemist: {
        select: {
          id: true,
          pharmacyName: true,
          contactPerson: true,
          depoId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return result;
};

const UpdateOrder = async (id: number, payload: any) => {
  const order = await prisma.order.findFirst({
    where: { id },
  });

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, "Order Not Found");
  }

  const updateData: Record<string, any> = {};
  if (payload?.chemistId !== undefined)
    updateData.chemistId = payload.chemistId;
  if (payload?.date !== undefined) updateData.date = new Date(payload.date);
  if (payload?.orderItem !== undefined)
    updateData.orderItem = {
      deleteMany: {},
      create: payload.orderItem.map((item: any) => ({
        productId: item.productId,
        quintity: item.quantity,
        tpRate: item.unitPrice,
        amount: item.amount,
      })),
    };

  const result = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: updateData,
    include: {
      orderItem: true,
    },
  });
  return result;
};

const changeOrderStatus = async (
  orderNo: string,
  payload: { status: string }
) => {
  const isOrder = await prisma.orderStatus.findFirst({
    where: {
      orderNo: orderNo,
    },
  });
  if (!isOrder) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Order Not found");
  }

  let status;

  switch (payload.status) {
    case "REVIEWING":
      status = OrdStatus.REVIEWING;
      break;
    case "CONFIRMED":
      status = OrdStatus.CONFIRMED;
      break;
    case "RECEIVED":
      status = OrdStatus.ON_THE_WAY;
      break;
    case "DELIVERED":
      status = OrdStatus.DELIVERED;
      break;
    case "CANCEL":
      status = OrdStatus.CANCELLED;
      break;
    case "RETURN":
      status = OrdStatus.RETURNED;
      break;
    default:
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid status value");
  }

  const result = await prisma.orderStatus.create({
    data: {
      status: status,
      orderNo: isOrder.orderNo,
    },
  });

  return result;
};

export const OrderService = {
  createOrder,
  getAllOrder,
  getOrderById,
  UpdateOrder,
  changeOrderStatus,
};
