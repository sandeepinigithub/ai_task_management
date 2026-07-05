const { User } = require("../models");
const { generateToken } = require("../utils/jwt.utils");
const ApiError = require("../utils/apiError");

const register = async (payload) => {
  // TODO: FIX IT @Sandeep
  const { username, email, password } = payload;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    role: 'employee',
  });

  const userObj = user.toJSON();
  return { user: userObj };
};

const login = async (payload) => {
  const { email, password } = payload;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken({ id: user._id, role: user.role });

  const userObj = user.toJSON();
  return { user: userObj, token };
};

module.exports = { register, login };
