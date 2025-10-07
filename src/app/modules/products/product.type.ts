import { Status } from "@prisma/client";
import z from "zod";

export type TcreateProduct = {
  id: number;
  name: string;
  description: string;
  subCategoryId: number;
  unitId: number;
  mrp: number;
  tp: number;
  size: string | null;
  isDeleted: boolean;
  status: Status;
  initialStock: {
    quantity: number;
    unitPrice: number;
    amount: number;
    date: Date;
    depoId: number;
  };
  createdAt: Date;
  updateAt: Date;
};
