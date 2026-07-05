const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} = require("../validations/task.validation");

// All task routes require authentication
router.use(authenticate);

// GET /api/tasks
router.get("/", validate(taskQuerySchema, "query"), taskController.getTasks);

// POST /api/tasks
router.post("/", validate(createTaskSchema), taskController.createTask);

// GET /api/tasks/dashboard/summary  — role-wise summary card counts
router.get("/dashboard/summary", taskController.getDashboardSummary);

// GET /api/tasks/dashboard/recent  — role-wise 5 most recent tasks
router.get("/dashboard/recent", taskController.getRecentTasks);

// GET /api/tasks/:id
router.get("/:id", taskController.getTaskById);

// PATCH /api/tasks/:id
router.patch("/:id", validate(updateTaskSchema), taskController.updateTask);

// DELETE /api/tasks/:id
router.delete("/:id", taskController.deleteTask);

module.exports = router;
