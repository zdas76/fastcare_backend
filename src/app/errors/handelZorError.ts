import { ZodError, ZodIssue } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handelZodError = (error: ZodError): TGenericErrorResponse => {
  let errorSources: TErrorSources = error.issues.map((issue: ZodIssue) => {
    const lastPath = issue?.path[issue.path.length - 1];
    return {
      path:
        typeof lastPath === "string" || typeof lastPath === "number"
          ? lastPath
          : "unknown",
      message: issue.message,
    };
  });
  const statusCode = 400;

  return {
    statusCode,
    message: "Validation error",
    errorSources,
  };
};

export default handelZodError;
