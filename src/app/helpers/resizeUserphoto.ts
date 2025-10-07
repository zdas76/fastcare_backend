import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { Request, Response, NextFunction } from "express";
import catchAsync from "../shared/catchAsync";

export const resizeUserImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    if (req.file) {
      try {
        const data = JSON.parse(req.body.data);
        const timestamp = Date.now();
        const fileExtension = req.file.originalname.split(".").pop() || "jpeg";
        const filename = `${timestamp}-${data.contactNo}.${fileExtension}`;
        const outputPath = path.join(process.cwd(), "/src/Image/ChemistPhoto");

        await fs.mkdir(outputPath, { recursive: true });

        await sharp(req.file.buffer)
          .resize(300, 300)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(path.join(outputPath, filename));

        req.body.photo = filename;
        next();
      } catch (error) {
        next(error);
      }
    }
  }
);
