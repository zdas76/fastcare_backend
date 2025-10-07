import { VoucherType } from "@prisma/client";
import prisma from "../../shared/prisma";

const getLastVoucherNumber = async (vcode: string) => {
  let voucherType;

  switch (vcode) {
    case "ODR":
      const orderResult = await prisma.order.findFirst({
        orderBy: {
          id: "desc",
        },
        select: {
          orderNo: true,
        },
      });
      return orderResult;

    case "FV":
      const fixedVoucher = await prisma.fixedJournal.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      return fixedVoucher;

    case "ALV":
      voucherType = VoucherType.ALLOCATION;
      break;

    case "PRV":
      voucherType = VoucherType.PURCHASE;
      break;

    case "SV":
      voucherType = VoucherType.SALES;
      break;

    case "PV":
      voucherType = VoucherType.PAYMENT;
      break;

    case "RV":
      voucherType = VoucherType.RECEIVED;
      break;

    case "CV":
      voucherType = VoucherType.CONTRA;
      break;

    case "JV":
      voucherType = VoucherType.JOURNAL;
      break;

    case "GV":
      voucherType = VoucherType.GIFT;
      break;

    case "MRV":
      voucherType = VoucherType.MONEY_RECEIVED;
      break;

    default:
      // voucherType = VoucherType.OTHER;
      return null;
  }

  const transactionResult = await prisma.transactionInfo.findFirst({
    where: {
      voucherType,
    },
    orderBy: {
      id: "desc",
    },
    select: {
      voucherNo: true,
    },
  });

  return transactionResult;
};

const getAllVoucher = async () => {
  const result = await prisma.transactionInfo.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getReportByVoucherNo = async (voucherNo: string) => {
  if (voucherNo) {
    const result = await prisma.transactionInfo.findFirst({
      where: { voucherNo },
      include: {
        chemist: {
          select: {
            chemistId: true,
            pharmacyName: true,
            address: true,
            discountRate: true,
          },
        },
        inventory: {
          select: {
            date: true,
            product: {
              select: {
                id: true,
                name: true,
                size: true,
                unit: { select: { name: true } },
              },
            },
            depo: {
              select: { id: true, depoName: true, location: true },
            },
            unitPrice: true,
            quantityAdd: true,
            quantityLess: true,
            debitAmount: true,
            creditAmount: true,
          },
        },
        bankTransaction: {
          select: {
            date: true,
            bankAccount: {
              select: {
                bankName: true,
                branceName: true,
                accountNumber: true,
              },
            },
            debitAmount: true,
            creditAmount: true,
          },
        },
        journal: {
          select: {
            ledgerHead: {
              select: {
                id: true,
                ledgerName: true,
              },
            },
            date: true,
            depo: {
              select: {
                id: true,
                depoName: true,
              },
            },
            creditAmount: true,
            debitAmount: true,
            narration: true,
          },
        },
      },
    });

    return result;
  } else {
    return null;
  }
};

const getpartyLadgertoBdById = async (params: any) => {
  const { chemistId, endDate, partyType, startDate, supplierId } = params;

  if (partyType === "chemist") {
    const chemist = await prisma.chemist.findFirst({
      where: {
        chemistId: chemistId,
        isDeleted: false,
      },
    });

    const result = await prisma.transactionInfo.findFirst({
      where: {
        chemistId: chemistId,
        date: {
          gte: startDate ? new Date(startDate) : chemist?.openingDate,
          lte: endDate ? new Date(endDate) : new Date(),
        },
      },
      include: {
        journal: true,
      },
    });
    return result;
  }

  if (partyType === "supplier") {
    const result = await prisma.transactionInfo.findFirst({
      where: {
        id: supplierId,
        date: {
          gte: new Date(startDate),
          lte: endDate ? new Date(endDate) : new Date(),
        },
      },
      include: {
        journal: true,
      },
    });
    return result;
  }
};

const getChemistLedgerById = async (params: any) => {
  const { chemistId, endDate, startDate } = params;

  const chemist = await prisma.chemist.findFirst({
    where: {
      chemistId: chemistId,
      isDeleted: false,
    },
  });

  const result = await prisma.transactionInfo.findFirst({
    where: {
      chemistId: chemistId,
      date: {
        gte: startDate ? new Date(startDate) : chemist?.openingDate,
        lte: endDate ? new Date(endDate) : new Date(),
      },
    },
    include: {
      journal: true,
    },
  });
  return result;
};

export const ReportService = {
  getLastVoucherNumber,
  getAllVoucher,
  getReportByVoucherNo,
  getpartyLadgertoBdById,
  getChemistLedgerById,
};
