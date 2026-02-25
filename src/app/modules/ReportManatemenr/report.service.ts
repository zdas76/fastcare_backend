import { string } from "zod";
import { VoucherType } from "../../../../generated/prisma";
import prisma from "../../shared/prisma";
import { DateRangeFilter } from "./report.controllers";
import { getDatesInRange } from "../../shared/DateRangeArray";

const getAllMpoTransection = async (payload: {
  startDate: string;
  endDate: string;
}) => {
  if (payload.endDate) {
    payload.endDate = new Date(
      new Date(payload.endDate).setHours(23, 59, 59, 999),
    ).toISOString();
  }
  const getMOPs = await prisma.user.findMany({
    where: {
      roles: { array_contains: "MPO" },
      status: "ACTIVE",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      roles: true,
      status: true,
    },
  });

  const mpoTransectionData = [];

  for (const mpo of getMOPs) {
    const scop = await prisma.scope.findFirst({
      where: {
        employeeId: mpo.employeeId,
      },
      include: {
        chemist: { select: { chemistId: true } },
      },
    });

    // Get the current date
    const today = new Date();

    const firstDay = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), 1),
    );

    const chemistIds = scop?.chemist.map((c: any) => c.chemistId) || [];

    const ledgerHeadId = await prisma.ledgerHead.findFirst({
      where: {
        ledgerName: {
          contains: "accounts receivable",
        },
      },
    });

    if (!ledgerHeadId) {
      throw new Error("Ledger head not found");
    }

    const transections = await prisma.journal.aggregate({
      _sum: { debitAmount: true, creditAmount: true },
      where: {
        transactionInfo: {
          is: {
            chemistId: { in: chemistIds },
          },
        },
        ledgerHeadId: ledgerHeadId?.id,
        date: {
          gte: payload.startDate ? new Date(payload.startDate) : firstDay,
          lte: payload.endDate ? new Date(payload.endDate) : new Date(),
        },
      },
    });

    mpoTransectionData.push({
      mpo,
      transections,
    });

    // const transections = await prisma.transection.AggregateChemist({
    //   where: {},
    // });
  }

  return mpoTransectionData;
};

const getMpoReportByEmployeeId = async (
  employeeId: string,
  filters: DateRangeFilter,
) => {
  const { startDate, endDate } = filters;

  // Scope
  const scope = await prisma.scope.findFirst({
    where: { employeeId },
    include: {
      chemist: { select: { chemistId: true } },
    },
  });

  // MPO info
  const mpo = await prisma.user.findFirst({
    where: { employeeId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      status: true,
      roles: true,
    },
  });

  if (!scope || !mpo) {
    throw new Error("MPO or Scope not found");
  }

  // Default dates
  const today = new Date();
  const firstDayOfMonth = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), 1),
  );

  const fromDate = startDate ? new Date(startDate) : firstDayOfMonth;
  const toDate = endDate ? new Date(endDate) : today;

  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }

  const chemistIds = scope.chemist.map((c) => c.chemistId);

  // Ledger head
  const ledgerHead = await prisma.ledgerHead.findFirst({
    where: {
      ledgerName: {
        contains: "accounts receivable",
      },
    },
  });

  if (!ledgerHead) {
    throw new Error("Ledger head not found");
  }

  // Transactions per chemist
  const transactions = await Promise.all(
    chemistIds.map(async (chemistId) => {
      const totals = await prisma.journal.aggregate({
        _sum: {
          debitAmount: true,
          creditAmount: true,
        },
        where: {
          ledgerHeadId: ledgerHead.id,
          transactionInfo: {
            chemistId,
          },
          date: {
            gte: fromDate,
            lte: toDate,
          },
        },
      });

      const chemist = await prisma.chemist.findFirst({
        where: { chemistId },
        select: {
          pharmacyName: true,
          openingDate: true,
          openingDueAmount: true,
        },
      });

      if (!chemist) {
        throw new Error("Chemist not found");
      }

      const dueStart = chemist?.openingDate;
      const dueEnd = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000); // Subtract one day

      const prev_due = await prisma.journal.aggregate({
        _sum: {
          debitAmount: true,
          creditAmount: true,
        },
        where: {
          ledgerHeadId: ledgerHead.id,
          transactionInfo: {
            chemistId,
          },
          date: {
            gte: dueStart,
            lte: dueEnd,
          },
        },
      });

      const salseReturn = await prisma.journal.aggregate({
        _sum: {
          debitAmount: true,
          creditAmount: true,
        },
        where: {
          ledgerHeadId: ledgerHead.id,
          transactionInfo: {
            chemistId,
            voucherType: VoucherType.SALES_RETURN,
          },
          date: {
            gte: fromDate,
            lte: toDate,
          },
        },
      });

      const debit = totals._sum.debitAmount ?? 0;
      const credit = totals._sum.creditAmount ?? 0;
      const prev_debit = prev_due._sum.debitAmount ?? 0;
      const prev_credit = prev_due._sum.creditAmount ?? 0;

      const salesReturn =
        (salseReturn?._sum?.creditAmount ?? 0) -
        (salseReturn?._sum?.debitAmount ?? 0) || 0;

      return {
        chemistId,
        chemist,
        debit,
        credit,
        balance: debit - credit,
        salesReturn,
        prev_due: prev_debit - prev_credit,
      };
    }),
  );

  return {
    mpo,
    transactions,
  };
};


const getAllMpoProgressReport = async ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  let fromDate: Date;
  let toDate: Date;

  const today = new Date();
  const firstDayOfMonth = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), 1),
  );

  fromDate = startDate ? new Date(startDate) : firstDayOfMonth;
  if (endDate) {
    toDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  } else {
    toDate = today;
  }


  const getMPO = await prisma.user.findMany({
    where: {
      roles: { array_contains: "MPO" },
      status: "ACTIVE",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      roles: true,
      status: true,
    },
  });

  const mpoProgressReport = [];

  for (const mpo of getMPO) {
    const scope = await prisma.scope.findFirst({
      where: {
        employeeId: mpo.employeeId,
      },
      include: {
        chemist: { select: { chemistId: true } },
      },
    });

    if (!scope) {
      throw new Error("Scope not found");
    }

    const target = await prisma.mpoTarget.findFirst({
      where: {
        employeeId: mpo.employeeId,
      },
    });

    const chemistIds = scope?.chemist.map((c: any) => c.chemistId) || [];



    // Ledger head
    const ledgerHead = await prisma.ledgerHead.findFirst({
      where: {
        ledgerName: {
          contains: "accounts receivable",
        },
      },
    });

    if (!ledgerHead) {
      throw new Error("Ledger head not found");
    }

    const transections = await prisma.journal.aggregate({
      _sum: { debitAmount: true, creditAmount: true },
      where: {
        transactionInfo: {
          is: {
            chemistId: { in: chemistIds },
          },
        },
        ledgerHeadId: ledgerHead.id,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });

    mpoProgressReport.push({
      mpo,
      target,
      transections,
    });
  }

  return mpoProgressReport;
};

const getGiftVoucherReport = async ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  let fromDate: Date;
  let toDate: Date;

  const today = new Date();
  const firstDayOfMonth = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), 1),
  );

  fromDate = startDate ? new Date(startDate) : firstDayOfMonth;
  if (endDate) {
    toDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  } else {
    toDate = today;
  }

  const getGiftVoucher = await prisma.transactionInfo.findMany({
    where: {
      voucherType: VoucherType.GIFT,
      date: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: {
      voucherNo: "desc",
    },
    select: {
      party: {
        select: {
          partyName: true,
          id: true,
        },
      },

      stakeholder: {
        select: {
          name: true,
          stakeId: true,
        },
      },
      user: {
        select: {
          name: true,
          employeeId: true,
        },
      },
      inventory: {
        select: {
          product: {
            select: {
              name: true,
            }
          },
          quantityLess: true,
          creditAmount: true,
          unitPrice: true,
        },
      },

      voucherType: true,
      voucherNo: true,
      id: true,
      date: true,

    },

  });

  return getGiftVoucher;
};

const getDipoMpoReport = async ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {


  const today = new Date();
  const firstDayOfMonth = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), 1),
  );

  const fromDate = startDate ? new Date(startDate) : firstDayOfMonth;
  const toDate = endDate
    ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
    : today;

  const MPOs = await prisma.user.findMany({
    where: {
      roles: { array_contains: "MPO" },
      status: "ACTIVE",
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
    },
  });

  const ledgerHead = await prisma.ledgerHead.findFirst({
    where: {
      ledgerName: {
        contains: "accounts receivable",
      },
    },
  });

  if (!ledgerHead) {
    throw new Error("Ledger head not found");
  }

  const reports = await Promise.all(
    MPOs.map(async (mpo) => {
      const scope = await prisma.scope.findFirst({
        where: { employeeId: mpo.employeeId },
        include: {
          chemist: { select: { chemistId: true } },
        },
      });

      const chemistIds = scope?.chemist.map((c) => c.chemistId) || [];

      // Current period transactions
      const totals = await prisma.journal.aggregate({
        _sum: { debitAmount: true, creditAmount: true },
        where: {
          ledgerHeadId: ledgerHead.id,
          transactionInfo: { chemistId: { in: chemistIds } },
          date: { gte: fromDate, lte: toDate },
        },
      });

      const officePaybleId = await prisma.ledgerHead.findFirst({
        where: {
          ledgerName: {
            in: ["office payable", "Office Payable",],
          },
        },
      });

      if (!officePaybleId) {
        throw new Error("Office payble not found");
      }

      // Dipo Collection
      const dipoCollection = await prisma.journal.aggregate({
        _sum: { debitAmount: true, creditAmount: true },
        where: {
          ledgerHeadId: officePaybleId.id,
          transactionInfo: { employeeId: mpo.employeeId },
          date: { gte: fromDate, lte: toDate },
        },
      });


      // Sales Return
      const returnTotals = await prisma.journal.aggregate({
        _sum: { debitAmount: true, creditAmount: true },
        where: {
          ledgerHeadId: ledgerHead.id,
          transactionInfo: {
            chemistId: { in: chemistIds },
            voucherType: VoucherType.SALES_RETURN,
          },
          date: { gte: fromDate, lte: toDate },
        },
      });

      const collection = dipoCollection._sum.creditAmount ?? 0;
      const salesReturn =
        (returnTotals._sum.creditAmount ?? 0) -
        (returnTotals._sum.debitAmount ?? 0);
      const dispatched = totals._sum.debitAmount ?? 0;

      const totalDue = (dispatched + salesReturn) - collection;

      return {
        id: mpo.id,
        employeeId: mpo.employeeId,
        name: mpo.name,
        dispatched,
        collection,
        salesReturn,
        totalDue,
      };
    }),
  );

  return reports;
};

const getDipoMpoReportById = async (
  employeeId: string,
  {
    startDate,
    endDate,
  }: {
    startDate?: string;
    endDate?: string;
  },
) => {
  const today = new Date();
  const firstDayOfMonth = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), 1),
  );

  const fromDate = startDate ? new Date(startDate) : firstDayOfMonth;
  const toDate = endDate
    ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
    : today;

  const mpo = await prisma.user.findFirst({
    where: { employeeId, status: "ACTIVE" },
    select: { id: true, employeeId: true, name: true },
  });

  if (!mpo) {
    throw new Error("MPO not found");
  }

  const ledgerHead = await prisma.ledgerHead.findFirst({
    where: {
      ledgerName: {
        contains: "accounts receivable",
      },
    },
  });

  if (!ledgerHead) {
    throw new Error("Ledger head not found");
  }

  const officePayableHead = await prisma.ledgerHead.findFirst({
    where: {
      ledgerName: {
        in: ["office payable", "Office Payable",],
      },
    },
  });

  if (!officePayableHead) {
    throw new Error("Office payable head not found");
  }

  const scope = await prisma.scope.findFirst({
    where: { employeeId: mpo.employeeId },
    include: {
      chemist: { select: { chemistId: true } },
    },
  });

  const chemistIds = scope?.chemist.map((c) => c.chemistId) || [];

  const Dates = getDatesInRange(fromDate.toISOString(), toDate.toISOString());

  let prevDue = 0;

  const prevDueResult = await prisma.journal.aggregate({
    _sum: { debitAmount: true, creditAmount: true },
    where: {
      ledgerHeadId: ledgerHead.id,
      transactionInfo: { chemistId: { in: chemistIds } },
      date: { lt: fromDate },
    },
  });

  prevDue = (prevDueResult._sum.debitAmount ?? 0) - (prevDueResult._sum.creditAmount ?? 0);

  const result = await Promise.all(
    Dates.map(async (date) => {
      const dailyDespatched = await prisma.journal.aggregate({
        _sum: { debitAmount: true },
        where: {
          ledgerHeadId: ledgerHead.id,
          transactionInfo: { chemistId: { in: chemistIds } },
          date: new Date(date),
        },
      });

      const dailyCollection = await prisma.journal.aggregate({
        _sum: { debitAmount: true, creditAmount: true },
        where: {
          ledgerHeadId: officePayableHead.id,
          transactionInfo: { employeeId: mpo.employeeId },
          date: new Date(date),
        },
      });

      const dailySalesReturn = await prisma.journal.aggregate({
        _sum: { debitAmount: true, creditAmount: true },
        where: {
          ledgerHeadId: ledgerHead.id,
          transactionInfo: {
            chemistId: { in: chemistIds },
            voucherType: VoucherType.SALES_RETURN,
          },
          date: new Date(date),
        },
      });

      const dailyTotalDue = (dailyDespatched._sum.debitAmount ?? 0) - (dailyCollection._sum.creditAmount ?? 0) + ((dailySalesReturn._sum.creditAmount ?? 0) - (dailySalesReturn._sum.debitAmount ?? 0));


      return {
        dailyDespatched: dailyDespatched._sum.debitAmount ?? 0,
        dailyCollection: dailyCollection._sum.creditAmount ?? 0,
        dailySalesReturn: dailySalesReturn._sum.creditAmount ?? 0,
        dailyTotalDue,
        date,

      };
    })
  )

  return {
    mpo,
    prevDue,
    result
  };
};

export const ReportManagementService = {
  getAllMpoTransection,
  getMpoReportByEmployeeId,
  getAllMpoProgressReport,
  getGiftVoucherReport,
  getDipoMpoReport,
  getDipoMpoReportById,
};
