// src/core/middleware/validation.middleware.ts

import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";

interface FormattedError {
  field: string;
  message: string;
}

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: FormattedError[] = errors.array().map((err) => ({
      field: "path" in err ? err.path : "unknown",
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }

  next();
};
