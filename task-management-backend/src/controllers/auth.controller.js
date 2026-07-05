const authService = require("../services/auth.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const register = async (req, res) => {
  try {
    const { user } = await authService.register(req.body);
    return successResponse(res, 201, "Registration successful", { user });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    return successResponse(res, 200, "Login successful", { user, token });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { login, register };
