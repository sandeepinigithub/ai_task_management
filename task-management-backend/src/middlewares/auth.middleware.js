const { verifyToken } = require("../utils/jwt.utils");
const { User } = require("../models");
const ApiError = require("../utils/apiError");
const { errorResponse } = require("../utils/apiResponse");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token is missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(401, "User not found or account deactivated");
    }
    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid access token");
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Access token has expired");
    }
    if (error instanceof ApiError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Authentication failed");
  }
};

module.exports = { authenticate };
