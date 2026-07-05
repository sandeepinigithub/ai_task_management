const Joi = require("joi");
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).trim().required().messages({
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must not exceed 30 characters",
    "any.required": "Username is required",
  }),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

module.exports = { registerSchema, loginSchema };
