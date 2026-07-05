const taskService = require("../services/task.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getTasks = async (req, res) => {
  try {
    const { tasks, meta } = await taskService.getTasks(req.user, req.query);
    return successResponse(res, 200, "Tasks retrieved successfully", { tasks }, meta);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.user, req.params.id);
    return successResponse(res, 200, "Task retrieved successfully", { task });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.user, req.body);
    // Emit real-time event to relevant users
    const io = req.app.get("io");
    if (io) {
      io.emit("task:created", { task, actorId: req.user._id });
    }
    return successResponse(res, 201, "Task created successfully", { task });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.user, req.params.id, req.body);
    const io = req.app.get("io");
    if (io) {
      io.emit("task:updated", { task, actorId: req.user._id });
    }
    return successResponse(res, 200, "Task updated successfully", { task });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.user, req.params.id);
    const io = req.app.get("io");
    if (io) {
      io.emit("task:deleted", { taskId: req.params.id, actorId: req.user._id });
    }
    return successResponse(res, 200, "Task deleted successfully", null);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const summary = await taskService.getDashboardSummary(req.user);
    return successResponse(res, 200, "Dashboard summary retrieved successfully", { summary });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getRecentTasks = async (req, res) => {
  try {
    const tasks = await taskService.getRecentTasks(req.user);
    return successResponse(res, 200, "Recent tasks retrieved successfully", { tasks });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
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
