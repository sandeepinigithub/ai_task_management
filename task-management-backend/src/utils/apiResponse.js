/**
 * Standard API success response
 */
const successResponse = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Standard API error response
 */
const errorResponse = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  const response = {
    success: false,
    message,
    data: null,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };
