const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const taskRoutes = require("./task.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);

module.exports = router;
