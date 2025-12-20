import { z } from "zod";
import { UserRole } from "../../../../generated/prisma";

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
  name: z.string().min(1, "Name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  officeContactNo: z.string().min(1, "Office contact number is required"),
  contactNo: z.string().optional(),
  emergencyContactNo: z.string().optional(),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  nid: z.string().optional(),
  dob: z.string().min(1, "Date of birth is required"),
  role: z.array(z.string()).min(1, "Please select at least one role"),
  photo: z.any().optional(),
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
