import z from "zod";

const createInventoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    category: z.string().max(255).optional(),
    supplier: z.string().max(255).optional(),
    unitePrice: z.number().nonnegative().default(0.0),
    quantity: z.number().nonnegative().default(0.0),
    totalCost: z.number().nonnegative().default(0.0),
    closingStocks: z.any().optional(),
  }),
});

export const InventoryValidation = {
  createInventoryValidationSchema,
};
