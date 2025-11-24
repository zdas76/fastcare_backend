import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";

const createScope = async (payload: any) => {
  console.log("first", payload);
  const employee = await prisma.user.findFirst({
    where: {
      employeeId: payload.employeeId,
    },
  });

  if (!employee) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No employee found");
  }
  const isExist = await prisma.scope.findFirst({
    where: {
      employeeId: employee?.employeeId,
    },
  });

  if (isExist) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Scope already created with this Name"
    );
  }

  await prisma.scope.create({
    data: {
      employeeId: employee?.employeeId,
      postId: payload.jobPostId,
      depo: {
        connect: payload.depos.map((id: number) => ({ id: id })) || [],
      },
      chemist: {
        connect: payload.chemist.map((id: string) => ({ chemistId: id })) || [],
      },
      stakeholder: {
        connect:
          payload.stakeholders?.map((id: string) => ({ stakeId: id })) || [],
      },
    },
  });
};

const getallScopes = async () => {
  const result = await prisma.scope.findMany({
    include: {
      stakeholder: {
        select: {
          name: true,
          stakeId: true,
        },
      },
      depo: {
        select: {
          depoName: true,
          id: true,
        },
      },
      chemist: {
        select: {
          pharmacyName: true,
          chemistId: true,
        },
      },
      user: {
        select: {
          name: true,
          employeeId: true,
        },
      },
      jobPost: {
        select: {
          postName: true,
          id: true,
        },
      },
    },
  });

  return result;
};

export const ScopeService = {
  createScope,
  getallScopes,
};
