const Joi = require("joi");

const ROLES = ["manager", "teamlead", "employee"];
const objectId = () => Joi.string().hex().length(24);

const createUserSchema = Joi.object({
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
  role: Joi.string().valid(...ROLES).required().messages({
    "any.only": `Role must be one of: ${ROLES.join(", ")}`,
    "any.required": "Role is required",
  }),
  teamLeadId: Joi.when("role", {
    is: "employee",
    then: objectId().optional().allow(null, ""),
    otherwise: Joi.forbidden(),
  }),
  managerId: Joi.when("role", {
    is: "teamlead",
    then: objectId().optional().allow(null, ""),
    otherwise: Joi.forbidden(),
  }),
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).trim().optional().messages({
    "string.min": "Username must be at least 3 characters",
  }),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().optional().messages({
    "string.email": "Please enter a valid email address",
  }),
  password: Joi.string().min(6).optional().messages({
    "string.min": "Password must be at least 6 characters",
  }),
  role: Joi.string().valid(...ROLES).optional().messages({
    "any.only": `Role must be one of: ${ROLES.join(", ")}`,
  }),
  isActive: Joi.boolean().optional(),
  teamLeadId: objectId().optional().allow(null, ""),
  managerId: objectId().optional().allow(null, ""),
}).min(1).messages({
  "object.min": "At least one field is required to update",
});

module.exports = { createUserSchema, updateUserSchema };
