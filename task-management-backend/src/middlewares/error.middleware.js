const ApiError = require("../utils/apiError");
const { errorResponse } = require("../utils/apiResponse");

// 404 handler - must be registered after all routes
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, 409, `${field} already exists`);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, 422, "Validation failed", errors);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return errorResponse(res, 400, `Invalid value for field: ${err.path}`);
  }

  // Operational errors (ApiError instances)
  if (err instanceof ApiError && err.isOperational) {
    return errorResponse(res, err.statusCode, err.message, err.errors);
  }

  // Unhandled / unexpected errors
  console.error("Unhandled error:", err);
  return errorResponse(res, 500, "An unexpected error occurred");
};

module.exports = { notFound, globalErrorHandler };
