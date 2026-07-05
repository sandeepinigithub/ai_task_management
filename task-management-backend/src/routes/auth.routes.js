const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validate } = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../validations/auth.validation");
// POST /api/auth/register (public)
router.post("/register", validate(registerSchema), authController.register);

// POST /api/auth/login (public)
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;
