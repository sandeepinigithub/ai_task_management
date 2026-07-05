const Joi = require("joi");

const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).trim().required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 100 characters",
    "any.required": "Task title is required",
  }),
  description: Joi.string().max(1000).trim().optional().allow(""),
  status: Joi.string().valid("pending", "inprogress", "completed").default("pending"),
  assignedTo: Joi.string().hex().length(24).optional().allow(null).messages({
    "string.hex": "assignedTo must be a valid user ID",
    "string.length": "assignedTo must be a valid user ID",
  }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).trim().optional(),
  description: Joi.string().max(1000).trim().optional().allow(""),
  status: Joi.string().valid("pending", "inprogress", "completed").optional(),
  assignedTo: Joi.string().hex().length(24).optional().allow(null).messages({
    "string.hex": "assignedTo must be a valid user ID",
    "string.length": "assignedTo must be a valid user ID",
  }),
}).min(1).messages({
  "object.min": "At least one field (title, description, status, assignedTo) is required",
});

const taskQuerySchema = Joi.object({
  status: Joi.string().valid("pending", "inprogress", "completed").optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  assignedTo: Joi.string().hex().length(24).optional(),
});

module.exports = { createTaskSchema, updateTaskSchema, taskQuerySchema };
