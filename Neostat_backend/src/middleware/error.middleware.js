import ApiError from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  // MongoDB duplicate key error.
  if (err.code === 11000) {
    statusCode = 409;
    message = "A user with this email already exists";
  }

  // Mongoose validation error.
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";

    errors = Object.values(err.errors).map((error) => error.message);
  }

  // Invalid MongoDB ObjectId.
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  // Invalid or expired JWT.
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};