import { date } from "zod";
import prisma from "../shared/prisma";

export const generateVoucherNumber = async (type: string) => {
  let voucherNo;

  if (type === "ODR") {
    const orderNo = await prisma.order.findFirst({
      orderBy: {
        id: "desc",
      },
      select: {
        orderNo: true,
      },
    });

    voucherNo = orderNo?.orderNo;
  }

  if (type === "MRV") {
    const VoucherNo = await prisma.transactionInfo.findFirst({
      where: {
        voucherNo: {
          contains: "MRV",
        },
      },
      orderBy: {
        id: "desc",
      },
      select: {
        voucherNo: true,
      },
    });

    voucherNo = VoucherNo?.voucherNo;
  }

  if (voucherNo) {
    const nextNumber = getNextNumber(voucherNo);

    const result = type + "-" + nextNumber;

    return result;
  } else {
    const number = "00000001";
    const result = type + "-" + number;
    return result;
  }
};

const getNextNumber = (voucherNo: string) => {
  const parts = voucherNo.split("-");
  const lastNumber = parseInt(parts[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(8, "0");
  return nextNumber;
};
