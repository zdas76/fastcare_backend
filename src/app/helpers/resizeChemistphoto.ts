import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import catchAsync from "../shared/catchAsync";
import { NextFunction, Request, Response } from "express";

export const resizeChemistImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Check if file exists
      if (!req.file || !req.file.buffer) {
        return next();
      }

      // 2. Parse the data safely
      let data;
      try {
        data = JSON.parse(req.body.data);
      } catch (err) {
        return next(new Error("Invalid data format"));
      }

      // 3. Validate required fields
      if (!data?.contactNo) {
        return next(new Error("Contact number is required"));
      }

      // 4. Prepare file information
      const timestamp = Date.now();
      const fileExtension = req.file.originalname.split(".").pop() || "jpeg";
      const filename = `${timestamp}-${data.contactNo}.${fileExtension}`;

      // 5. Prepare output path
      const outputPath = path.join(process.cwd(), "src/Image/ChemistPhoto");
      const fullPath = path.join(outputPath, filename);

      // 6. Ensure directory exists
      await fs.mkdir(outputPath, { recursive: true });

      // 7. Process image
      await sharp(req.file.buffer)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({
          quality: 90,
          mozjpeg: true, // Better compression
        })
        .toFile(fullPath);

      // 8. Store filename for later use
      req.body.photo = filename;

      next();
    } catch (error) {
      next(new Error("Failed to process image"));
    }
  }
);
