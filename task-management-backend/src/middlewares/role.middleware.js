const ApiError = require("../utils/apiError");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Middleware factory that checks if the logged-in user has one of the allowed roles.
 * Usage: authorize("manager", "teamlead")
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Authentication required");
    }
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Required role(s): ${allowedRoles.join(", ")}`
      );
    }
    next();
  };
};

module.exports = { authorize };
