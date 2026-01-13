import { StatusCodes } from "http-status-codes";
import {
  Status,
  UserStatus,
  VoucherType,
} from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";
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
      select: {
        date: true,
        chemistId: true,
        voucherNo: true,
        voucherType: true,
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
          },
        },
      },
    });

    // Calculate PreDue for Sales Voucher
    let PreDue;

    if (voucherNo.startsWith("SV")) {
      if (!result) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          "No transaction found with the given voucher number"
        );
      }
      const chemistExists = await prisma.chemist.findFirst({
        where: {
          chemistId: result?.chemistId!,
          isDeleted: false,
        },
        select: {
          chemistId: true,
          openingDate: true,
        },
      });

      const ledgerHeadId = await prisma.ledgerHead.findFirst({
        where: {
          ledgerName: {
            equals: "Accounts Receivable",
          },
        },
      });

      if (!ledgerHeadId) {
        throw new AppError(StatusCodes.NOT_FOUND, "Ledger Head not found");
      }

      if (!chemistExists) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          "No chemist found for the given transaction"
        );
      }

      let endDate = new Date(result.date);
      endDate.setHours(23, 59, 59, 999);

      PreDue = await prisma.journal.aggregate({
        _sum: {
          debitAmount: true,
          creditAmount: true,
        },
        where: {
          AND: [
            { transactionInfo: { chemistId: chemistExists.chemistId } },
            {
              transactionInfo: {
                date: { gt: chemistExists.openingDate, lte: endDate },
              },
            },
            {
              transactionInfo: {
                voucherNo: { not: voucherNo },
              },
            },
            { ledgerHeadId: ledgerHeadId.id },
          ],
        },
      });
    }

    return { PreDue, result };
  } else {
    return null;
  }
};

const getpartyLadgertoBdById = async (params: any) => {
  const { ledgerType, endDate, startDate, id } = params;

  console.log(params);

  const start = startDate ? new Date(startDate) : null;

  let end = new Date(); // Default to now
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  if (ledgerType === "employee") {
    const employee = await prisma.user.findFirst({
      where: {
        employeeId: id,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
      },
    });

    if (!employee) {
      throw new AppError(StatusCodes.NOT_FOUND, "No Employee ofund");
    }

    const closingDate = await prisma.journal.findFirst({
      where: {
        transactionInfo: {
          employeeId: employee.employeeId,
        },
        isClosing: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const ledgerId = await prisma.ledgerHead.findFirst({
      where: {
        ledgerName: {
          contains: "office Payable",
        },
      },
    });

    if (!ledgerId) {
      throw new AppError(StatusCodes.NOT_FOUND, "Ledger head not found");
    }

    const result = await prisma.journal.findMany({
      where: {
        transactionInfo: {
          employeeId: employee.employeeId,
        },
        ledgerHeadId: ledgerId.id,
        date: {
          gte: start || closingDate?.date || new Date(),
          lte: end,
        },
      },
      include: {
        transactionInfo: {
          select: {
            voucherNo: true,
            employeeId: true,
            voucherType: true,
          },
        },
      },
    });

    return { employee, result };
  }

  if (ledgerType === "vendor") {
    const vendor = await prisma.party.findFirst({
      where: {
        id: Number(id),
        isDeleted: false,
      },
    });

    if (!vendor) {
      throw new AppError(StatusCodes.NOT_FOUND, "No vendor found");
    }

    const ledgerId = await prisma.ledgerHead.findFirst({
      where: {
        ledgerName: {
          contains: "receivable",
        },
      },
    });

    if (!ledgerId) {
      throw new AppError(StatusCodes.NOT_FOUND, "Ledger head not found");
    }

    const result = await prisma.journal.findMany({
      where: {
        transactionInfo: {
          partyId: vendor.id,
        },
        ledgerHeadId: ledgerId.id,

        date: {
          gte: start || new Date(),
          lte: end,
        },
      },
      include: {
        transactionInfo: {
          select: {
            voucherNo: true,
            partyId: true,
            voucherType: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return { vendor, result };
  }

  if (ledgerType === "depo") {
    const depo = await prisma.depo.findFirst({
      where: {
        id: Number(id),
        status: Status.ACTIVE,
      },
    });

    if (!depo) {
      throw new AppError(StatusCodes.NOT_FOUND, "No depo found");
    }

    const closingDate = await prisma.journal.findFirst({
      where: {
        depoId: depo.id,
        isClosing: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    let ledgerHeadId;

    if (depo.id === 1) {
      ledgerHeadId = await prisma.ledgerHead.findFirst({
        where: {
          ledgerName: {
            contains: "accounts receivable",
          },
        },
      });
    } else {
      ledgerHeadId = await prisma.ledgerHead.findFirst({
        where: {
          ledgerName: {
            contains: "accounts payable",
          },
        },
      });
    }

    if (!ledgerHeadId) {
      throw new AppError(StatusCodes.NOT_FOUND, "Ledger head not found");
    }

    const result = await prisma.journal.findMany({
      where: {
        depoId: depo.id,
        ledgerHeadId: ledgerHeadId.id,
        date: {
          gte: start || closingDate?.date || new Date(),
          lte: end || new Date(),
        },
      },
      include: {
        transactionInfo: {
          select: {
            voucherNo: true,
            voucherType: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return { depo, result };
  }
};

const getChemistLedgerById = async (params: any) => {
  const { chemistId, endDate, startDate } = params;

  const chemist = await prisma.chemist.findFirst({
    where: {
      chemistId: chemistId,
      isDeleted: false,
    },
    select: {
      chemistId: true,
      pharmacyName: true,
      address: true,
      openingDate: true,
      contactNo: true,
      contactPerson: true,
    },
  });

  const LedgerHead = await prisma.ledgerHead.findFirst({
    where: {
      ledgerName: {
        equals: "Accounts Receivable",
      },
    },
  });

  if (LedgerHead == null) {
    throw new AppError(StatusCodes.NOT_FOUND, "Ledger Head not found");
  }

  let end = new Date(); // Default to now
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  const start = startDate ? new Date(startDate) : chemist?.openingDate;

  const ChemistLedgerData = await prisma.journal.findMany({
    where: {
      ledgerHeadId: LedgerHead.headCodeId,
      transactionInfo: { chemistId: chemistId },
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      date: "asc",
    },
    include: {
      transactionInfo: {
        select: {
          voucherNo: true,
          voucherType: true,
        },
      },
    },
  });

  return { ChemistLedgerData, chemist };
};

const getSupplierLedgerById = async (params: any) => {
  const { supplierId, endDate, startDate } = params;

  const supplier = await prisma.party.findFirst({
    where: {
      id: Number(supplierId),
      isDeleted: false,
    },

    select: {
      id: true,
      partyName: true,
      address: true,
      contactNo: true,
    },
  });

  const LedgerHead = await prisma.ledgerHead.findFirst({
    where: {
      ledgerName: {
        equals: "accounts payable",
      },
    },
  });

  if (LedgerHead == null) {
    throw new AppError(StatusCodes.NOT_FOUND, "Ledger Head not found");
  }

  const closingDate = await prisma.journal.findFirst({
    where: {
      transactionInfo: {
        partyId: supplier?.id,
      },
      isClosing: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  let end = new Date(); // Default to now
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  const start = startDate ? new Date(startDate) : closingDate?.date;

  const SupplierLedgerData = await prisma.journal.findMany({
    where: {
      ledgerHeadId: LedgerHead.headCodeId,
      transactionInfo: { partyId: supplier?.id },
      date: {
        gte: start || new Date(),
        lte: end,
      },
    },
    orderBy: {
      date: "desc",
    },
    include: {
      transactionInfo: {
        select: {
          voucherNo: true,
          voucherType: true,
          partyId: true,
        },
      },
    },
  });

  return { SupplierLedgerData, supplier };
};

const getAccountHeadLedgerById = async (params: any) => {
  const { headCodeId, endDate, startDate } = params;

  const LedgerHead = await prisma.ledgerHead.findFirst({
    where: {
      id: Number(headCodeId),
    },
  });

  if (!LedgerHead) {
    throw new AppError(StatusCodes.NOT_FOUND, "Ledger Head not found");
  }
  let end = new Date(); // Default to now
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  const start = startDate ? new Date(startDate) : null;

  const AccountHeadLedgerData = await prisma.journal.findMany({
    where: {
      ledgerHeadId: LedgerHead.id,
      date: {
        gte: start || new Date(),
        lte: end,
      },
    },
    orderBy: {
      date: "desc",
    },
    include: {
      transactionInfo: {
        select: {
          date: true,
          voucherNo: true,
          voucherType: true,
        },
      },
    },
  });

  return { AccountHeadLedgerData, LedgerHead };
};

export const ReportService = {
  getLastVoucherNumber,
  getAllVoucher,
  getReportByVoucherNo,
  getpartyLadgertoBdById,
  getChemistLedgerById,
  getSupplierLedgerById,
  getAccountHeadLedgerById,
};
