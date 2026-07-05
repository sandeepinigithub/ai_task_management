const { User } = require("../models");
const ApiError = require("../utils/apiError");

/**
 * Manager: get all users with optional role filter.
 * Team Lead: get their assigned employees.
 */
const getUsers = async (requestingUser, query = {}) => {
  const { role: filterRole, page = 1, limit = 20 } = query;

  let filter = {};

  if (requestingUser.role === "manager") {
    filter._id = { $ne: requestingUser._id };
    if (filterRole) filter.role = filterRole;
  } else if (requestingUser.role === "teamlead") {
    filter.teamLeadId = requestingUser._id;
    filter.role = "employee";
  } else {
    throw new ApiError(403, "Access denied");
  }

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
    select: "-password",
    populate: [
      { path: "teamLeadId", select: "username email" },
      { path: "managerId", select: "username email" },
    ],
  };

  const result = await User.paginate(filter, options);

  return {
    users: result.docs,
    meta: {
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  };
};

/**
 * Master user list — role-scoped flat list (id + username + role).
 * Manager  → all users
 * Team Lead → self + own employees
 * Employee  → self only
 */
const getMasterUserList = async (requestingUser) => {
  let filter = {};

  if (requestingUser.role === "manager") {
    // no filter — all users
  } else if (requestingUser.role === "teamlead") {
    // self + employees under this team lead
    filter = {
      $or: [
        { _id: requestingUser._id },
        { teamLeadId: requestingUser._id, role: "employee" },
      ],
    };
  } else {
    // employee — self only
    filter = { _id: requestingUser._id };
  }

  const users = await User.find(filter).select("_id username role").lean();
  return users.map((u) => ({ _id: u._id, username: u.username, role: u.role }));
};

/**
 * Get a single user by ID (with role-based visibility).
 */
const getUserById = async (requestingUser, targetUserId) => {
  const targetUser = await User.findById(targetUserId)
    .select("-password")
    .populate("teamLeadId", "username email role")
    .populate("managerId", "username email role");

  if (!targetUser) throw new ApiError(404, "User not found");

  if (requestingUser.role === "manager") return targetUser;

  if (requestingUser.role === "teamlead") {
    if (
      targetUser._id.equals(requestingUser._id) ||
      (targetUser.role === "employee" && targetUser.teamLeadId && targetUser.teamLeadId._id.equals(requestingUser._id))
    ) {
      return targetUser;
    }
    throw new ApiError(403, "Access denied");
  }

  throw new ApiError(403, "Access denied");
};

/**
 * Manager: create a new user with any role.
 * - teamlead role → stores managerId (set to creating manager if omitted)
 * - employee role → stores teamLeadId (optional)
 */
const createUser = async (requestingUser, payload) => {
  const { username, email, password, role, teamLeadId, managerId } = payload;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "A user with this email already exists");

  if (role === "employee" && teamLeadId) {
    const tl = await User.findById(teamLeadId);
    if (!tl || tl.role !== "teamlead") {
      throw new ApiError(400, "Provided teamLeadId does not belong to a team lead");
    }
  }

  if (role === "teamlead" && managerId) {
    const mgr = await User.findById(managerId);
    if (!mgr || mgr.role !== "manager") {
      throw new ApiError(400, "Provided managerId does not belong to a manager");
    }
  }

  const user = await User.create({
    username,
    email,
    password,
    role,
    teamLeadId: role === "employee" ? teamLeadId || null : null,
    managerId: role === "teamlead" ? managerId || requestingUser._id : null,
    isActive: true,
  });

  return User.findById(user._id)
    .select("-password")
    .populate("teamLeadId", "username email role")
    .populate("managerId", "username email role");
};

/**
 * Manager: update any user's details.
 * Password is only hashed if explicitly provided (handled by model pre-save).
 */
const updateUser = async (targetUserId, payload) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, "User not found");

  const { username, email, role, isActive, teamLeadId, managerId } = payload;

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "A user with this email already exists");
    user.email = email;
  }

  if (username !== undefined) user.username = username;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  if (teamLeadId !== undefined) user.teamLeadId = teamLeadId || null;
  if (managerId !== undefined) user.managerId = managerId || null;

  await user.save();

  return User.findById(user._id)
    .select("-password")
    .populate("teamLeadId", "username email role")
    .populate("managerId", "username email role");
};

/**
 * Manager: delete a user. Prevents self-deletion.
 */
const deleteUser = async (requestingUser, targetUserId) => {
  if (requestingUser._id.equals(targetUserId)) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, "User not found");

  await User.findByIdAndDelete(targetUserId);
};

module.exports = {
  getUsers,
  getMasterUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
