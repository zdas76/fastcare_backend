import prisma from "../../shared/prisma";
import { DateRangeFilter } from "./report.controllers";

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

      const debit = totals._sum.debitAmount ?? 0;
      const credit = totals._sum.creditAmount ?? 0;

      return {
        chemistId,
        debit,
        credit,
        balance: debit - credit,
      };
    }),
  );

  return {
    mpo,
    dateRange: { fromDate, toDate },
    transactions,
  };
};

export const ReportManagementService = {
  getAllMpoTransection,
  getMpoReportByEmployeeId,
};
