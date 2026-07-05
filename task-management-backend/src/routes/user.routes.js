const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createUserSchema,
  updateUserSchema,
} = require("../validations/user.validation");

// All user routes require authentication
router.use(authenticate);

// GET  /api/users          — Manager: all users | Team Lead: their employees
router.get("/", authorize("manager", "teamlead"), userController.getUsers);

// POST /api/users         — Manager: all users | Team Lead: their employees
router.post("/", authorize("manager"), validate(createUserSchema), userController.createUser);

// GET  /api/users/master-list — All roles: scoped flat list (manager=all, teamlead=self+team, employee=self)
router.get("/master-list", userController.getMasterUserList);

// GET    /api/users/:id    — Manager or Team Lead (scoped)
router.get("/:id", authorize("manager", "teamlead"), userController.getUserById);

// PATCH  /api/users/:id    — Manager only: update user details
router.patch("/:id", authorize("manager"), validate(updateUserSchema), userController.updateUser);

// DELETE /api/users/:id    — Manager only: remove a user
router.delete("/:id", authorize("manager"), userController.deleteUser);

module.exports = router;
