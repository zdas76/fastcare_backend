import prisma from "../../shared/prisma";

const getCustomerById = async (contact: string) => {
  const result = await prisma.chemist.findMany({
    where: {
      contactNo: {
        contains: contact,
      },
    },
  });
  return result;
};

export const CustomerService = {
  getCustomerById,
};
