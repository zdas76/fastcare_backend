import { UserRole } from "@prisma/client";
import { z } from "zod";

const createEmployee = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  nid: z.string().optional(),
  dob: z.string().optional(),
  workingPlase: z.string(),
  address: z.string(),
  mobile: z.string(),
});

const updateEmployee = z.object({
  name: z.string().optional(),
  nid: z.string().optional(),
  dob: z.string().optional(),
  workingPlase: z.string().optional(),
  address: z.string().optional(),
  mobile: z.string().optional(),
});

export const userValidaton = {
  createEmployee,
  updateEmployee,
};

export interface User {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  photo?: string | null;
  fatherName: string;
  motherName: string;
  officeContactNo?: string | null;
  emergencyContactNo: string | null;
  currentAddress?: string | null;
  permanentAddress?: string | null;
  nid?: string | null;
  dob: Date;
  contactNo: string;
}
