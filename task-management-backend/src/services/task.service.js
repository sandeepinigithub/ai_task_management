const { Task, User } = require("../models");
const ApiError = require("../utils/apiError");

/**
 * Resolves the assignedTo constraint based on the requesting user's role.
 *
 * - manager  : no constraint by default; optionally scoped to a specific user.
 * - teamlead : scoped to themselves + their direct reports; optionally narrowed to one member.
 * - employee : always scoped to themselves only.
 */
const resolveAssignedToScope = async (requestingUser, assignedTo) => {
  const { role, _id } = requestingUser;

  if (role === "manager") {
    return assignedTo ? { assignedTo } : {};
  }

  if (role === "teamlead") {
    const teamMembers = await User.find({ teamLeadId: _id }).select("_id");
    const teamMemberIds = [...teamMembers.map((m) => m._id), _id];
    return { assignedTo: assignedTo ?? { $in: teamMemberIds } };
  }
  // employee — always restricted to self
  return { assignedTo: _id };
};

/**
 * Builds a MongoDB filter for task queries, applying:
 *   1. Role-based visibility scope  (who can see which tasks)
 *   2. Optional status filter
 *   3. Optional full-text search    (title / description, case-insensitive)
 *   4. Optional createdBy filter
 */
const buildTaskFilter = async (requestingUser, queryFilters = {}) => {
  const { search, status, assignedTo, createdBy } = queryFilters;

  const scopeFilter = await resolveAssignedToScope(requestingUser, assignedTo);
  const statusFilter = status ? { status } : {};
  const createdByFilter = createdBy ? { createdBy } : {};
  const searchFilter = search?.trim()
    ? {
      $or: [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ]
    }
    : {};

  return {
    ...scopeFilter,
    ...statusFilter,
    ...createdByFilter,
    ...searchFilter,
  };
};

/**
 * Get paginated task list.
 */
const getTasks = async (requestingUser, query = {}) => {
  const { page = 1, limit = 10, search, status, assignedTo, createdBy } = query;

  const filter = await buildTaskFilter(requestingUser, { search, status, assignedTo, createdBy });

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "assignedTo", select: "username email role" },
      { path: "createdBy", select: "username email role" },
      { path: "teamLeadId", select: "username email" },
    ],
  };

  const result = await Task.paginate(filter, options);

  return {
    tasks: result.docs,
    meta: {
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  };
};

/**
 * Get a single task by ID.
 */
const getTaskById = async (requestingUser, taskId) => {
  const task = await Task.findById(taskId)
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email role")
    .populate("teamLeadId", "username email");

  if (!task) throw new ApiError(404, "Task not found");

  await assertTaskAccess(requestingUser, task, "read");

  return task;
};

/**
 * Create a new task.
 * - Employee: auto-assigned to self; teamLeadId derived from their profile.
 * - Team Lead: can assign to self or their team members.
 * - Manager: can assign to anyone.
 */
const createTask = async (requestingUser, taskData) => {
  const { title, description, status, assignedTo } = taskData;

  let finalAssignedTo = requestingUser._id;
  let teamLeadId = null;

  if (requestingUser.role === "employee") {
    finalAssignedTo = requestingUser._id;
    teamLeadId = requestingUser.teamLeadId || null;
  } else if (requestingUser.role === "teamlead") {
    if (assignedTo) {
      await assertTeamLeadCanAssign(requestingUser, assignedTo);
      const assignee = await User.findById(assignedTo);
      finalAssignedTo = assignedTo;
      teamLeadId = requestingUser._id;
      if (assignee && assignee.role === "teamlead" && assignee._id.equals(requestingUser._id)) {
        teamLeadId = requestingUser._id;
      }
    } else {
      finalAssignedTo = requestingUser._id;
      teamLeadId = requestingUser._id;
    }
  } else if (requestingUser.role === "manager") {
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) throw new ApiError(404, "Assigned user not found");
      finalAssignedTo = assignedTo;
      teamLeadId = assignee.teamLeadId || null;
      if (assignee.role === "teamlead") teamLeadId = assignee._id;
    } else {
      finalAssignedTo = requestingUser._id;
    }
  }

  const task = await Task.create({
    title,
    description,
    status,
    assignedTo: finalAssignedTo,
    createdBy: requestingUser._id,
    teamLeadId,
  });

  return Task.findById(task._id)
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email role")
    .populate("teamLeadId", "username email");
};

/**
 * Update a task's title, description, status, and/or assignedTo.
 * assignedTo follows the same role-based rules as reassignTask.
 */
const updateTask = async (requestingUser, taskId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  await assertTaskAccess(requestingUser, task, "write");

  const { title, description, status, assignedTo } = updates;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;

  // Handle reassignment — employees cannot reassign so assignedTo is ignored for them
  if (assignedTo !== undefined && assignedTo !== null && requestingUser.role !== "employee") {
    const newAssignee = await User.findById(assignedTo);
    if (!newAssignee) throw new ApiError(404, "Assigned user not found");

    if (requestingUser.role === "manager") {
      task.assignedTo = assignedTo;
      task.teamLeadId = newAssignee.role === "teamlead"
        ? newAssignee._id
        : newAssignee.teamLeadId || null;
    } else if (requestingUser.role === "teamlead") {
      await assertTeamLeadCanAssign(requestingUser, assignedTo);
      task.assignedTo = assignedTo;
      task.teamLeadId = requestingUser._id;
    }
  }

  await task.save();

  return Task.findById(task._id)
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email role")
    .populate("teamLeadId", "username email");
};

/**
 * Delete a task.
 * - Manager: can delete any task.
 * - Team Lead / Employee: can delete tasks they created.
 */
const deleteTask = async (requestingUser, taskId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  if (requestingUser.role === "manager") {
    await Task.findByIdAndDelete(taskId);
    return;
  }

  if (!task.createdBy.equals(requestingUser._id)) {
    throw new ApiError(403, "You can only delete tasks you created");
  }

  await Task.findByIdAndDelete(taskId);
};

// Private helpers

/**
 * Verify the requesting user can access the task.
 */
const assertTaskAccess = async (requestingUser, task, mode = "read") => {
  if (requestingUser.role === "manager") return;

  if (requestingUser.role === "teamlead") {
    const teamMembers = await User.find({ teamLeadId: requestingUser._id }).select("_id");
    const allowedIds = [
      requestingUser._id.toString(),
      ...teamMembers.map((m) => m._id.toString()),
    ];
    if (!allowedIds.includes(task.assignedTo.toString())) {
      throw new ApiError(403, "Access denied: task not in your team");
    }
    return;
  }

  // Employee: can only access tasks assigned to them
  if (!task.assignedTo.equals(requestingUser._id)) {
    throw new ApiError(403, "Access denied: task not assigned to you");
  }
};

/**
 * Assert that a team lead can assign to the given user ID.
 */
const assertTeamLeadCanAssign = async (teamLead, targetUserId) => {
  if (teamLead._id.equals(targetUserId)) return;

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, "Target user not found");

  if (
    targetUser.role !== "employee" ||
    !targetUser.teamLeadId ||
    !targetUser.teamLeadId.equals(teamLead._id)
  ) {
    throw new ApiError(403, "You can only assign tasks to your own team members");
  }
};

/**
 * Dashboard: summary card counts (total, pending, inprogress, completed).
 * Scoped by the requesting user's role.
 */
const getDashboardSummary = async (requestingUser) => {
  const filter = await buildTaskFilter(requestingUser);

  const [total, pending, inprogress, completed] = await Promise.all([
    Task.countDocuments(filter),
    Task.countDocuments({ ...filter, status: "pending" }),
    Task.countDocuments({ ...filter, status: "inprogress" }),
    Task.countDocuments({ ...filter, status: "completed" }),
  ]);

  return { total, pending, inprogress, completed };
};

/**
 * Dashboard: Recent 5 created tasks, scoped by role.
 */
const getRecentTasks = async (requestingUser) => {
  const filter = await buildTaskFilter(requestingUser);

  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email role")
    .populate("teamLeadId", "username email");

  return tasks;
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDashboardSummary,
  getRecentTasks,
};
