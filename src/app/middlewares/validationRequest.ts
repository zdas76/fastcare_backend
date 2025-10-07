import type { NextFunction } from "express";
import type { ZodObject } from "zod";

const validationRequiest =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
      });
      return next();
    } catch (error) {
      next(error);
    }
  };

export default validationRequiest;
