import cors from "cors";
import { StatusCodes } from "http-status-codes";
import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";

import path from "path";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

const app: Application = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://acc.fastcaredermalyn.com",
      "http://acc.fastcaredermalyn.com",
    ],
    credentials: true,
  })
);

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  "/api/v1/Image/",
  express.static(path.join(process.cwd(), "src/Image/"))
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
