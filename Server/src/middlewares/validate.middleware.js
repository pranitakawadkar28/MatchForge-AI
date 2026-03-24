import { AppError } from "../utils/AppError.js";

// Body validation
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map(err => err.message).join(", ");
    return next(new AppError(message, 400));
  }

  req.body = result.data;
  next();
};

// Query validation
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const message = result.error.issues.map(err => err.message).join(", ");
    return next(new AppError(message, 400));
  }

  req.validatedQuery = result.data;
  next();
};

// Params validation
export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    const message = result.error.issues.map(err => err.message).join(", ");
    return next(new AppError(message, 400));
  }

  req.validatedParams = result.data;
  next();
};
