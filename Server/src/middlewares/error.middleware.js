import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }	

  // Unknown errors
  console.log(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
