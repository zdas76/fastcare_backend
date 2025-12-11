import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";

const createScope = async (payload: any) => {
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

const updateScope = async (payload: any) => {
  const myscope = await prisma.scope.findFirst({
    where: {
      id: payload.id,
    },
    include: {
      depo: {
        select: {
          id: true,
        },
      },
      chemist: {
        select: {
          chemistId: true,
        },
      },
      stakeholder: {
        select: {
          stakeId: true,
        },
      },
    },
  });

  if (!myscope) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No Scope found");
  }

  const result = await prisma.scope.update({
    where: {
      id: payload.id,
    },
    data: {
      depo: {
        set: [],
        connect: payload.depo.map((id: number) => ({ id })) || myscope.depo,
      },
      chemist: {
        set: [],
        connect:
          payload.chemist.map((id: string) => ({ chemistId: id })) ||
          myscope.chemist,
      },
      stakeholder: {
        set: [],
        connect:
          payload.stakeholders?.map((id: string) => ({ stakeId: id })) ||
          myscope.stakeholder,
      },
      employeeId: payload.employeeId || myscope.employeeId,
      postId: payload.jobPostId || myscope.postId,
    },
  });

  return result;
};

export const ScopeService = {
  createScope,
  getallScopes,
  updateScope,
};
