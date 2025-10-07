import { PrismaClient } from "@prisma/client";
import prisma from "../shared/prisma";

export const generateId = async (prefix: string, model: keyof PrismaClient) => {
  const findLast = await (prisma[model] as any).findFirst({
    orderBy: {
      id: "desc",
    },
  });

  if (model === "user" && prefix === "FCDE") {
    const lastId = findLast?.employeeId || "2106";
    const lastIdNumber = lastId?.split("-")[1];

    const nextNumber = lastIdNumber
      ? String(Number(lastIdNumber) + 1).padStart(8, "0")
      : "21060001";
    return `${prefix}-${nextNumber}`;
  }

  if (model === "chemist" && prefix === "CMST") {
    const lastId = findLast?.chemistId || "2106";
    const lastIdNumber = lastId?.split("-")[1];

    console.log(lastIdNumber);

    const nextNumber = lastIdNumber
      ? String(Number(lastIdNumber) + 1).padStart(7, "0")
      : "2106001";
    return `${prefix}-${nextNumber}`;
  }

  if (model === "stakeholder" && prefix === "STK") {
    const lastId = findLast?.stakeId || "2106";
    const lastIdNumber = lastId?.split("-")[1];

    const nextNumber = lastIdNumber
      ? String(Number(lastIdNumber) + 1).padStart(8, "0")
      : "21060001";
    return `${prefix}-${nextNumber}`;
  }
};
