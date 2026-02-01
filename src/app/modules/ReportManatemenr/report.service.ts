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

  const scop = await prisma.scope.findFirst({
    where: {
      employeeId: employeeId,
    },
    include: {
      chemist: { select: { chemistId: true } },
    },
  });

  // Get the current date
  const today = new Date();

  const firstDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));

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

  const transections = await prisma.journal.findMany({
    where: {
      transactionInfo: {
        is: {
          chemistId: { in: chemistIds },
        },
      },
      ledgerHeadId: ledgerHeadId?.id,
      date: {
        gte: startDate ? new Date(startDate) : firstDay,
        lte: endDate ? new Date(endDate) : new Date(),
      },
    },
  });
  return transections;
};

export const ReportManagementService = {
  getAllMpoTransection,
  getMpoReportByEmployeeId,
};
