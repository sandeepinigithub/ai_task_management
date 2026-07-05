const { verifyToken } = require("../utils/jwt.utils");
const { User } = require("../models");

/**
 * Initialise Socket.IO and attach JWT authentication.
 * Clients must send: socket.auth = { token: "<bearer_token>" }
 *
 * Events emitted from server to clients:
 *   task:created   - { task, actorId }
 *   task:updated   - { task, actorId }
 *   task:reassigned - { task, actorId }
 *   task:deleted   - { taskId, actorId }
 */
const initSocket = (io) => {
  // Middleware: authenticate every socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("-password");
      if (!user || !user.isActive) {
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const { _id, role, username } = socket.user;
    console.log(`Socket connected: ${username} (${role}) — ${socket.id}`);

    // Each user joins a personal room for targeted events
    socket.join(`user:${_id}`);

    // Role-based rooms for broadcast events
    socket.join(`role:${role}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${username} — ${socket.id}`);
    });
  });
};

/**
 * Emit a task event to all relevant parties:
 *  - The task assignee
 *  - Their team lead (if any)
 *  - All managers
 */
const emitTaskEvent = async (io, eventName, payload) => {
  if (!io) return;

  const { task } = payload;

  // Notify the assignee
  if (task?.assignedTo?._id || task?.assignedTo) {
    const assigneeId = task?.assignedTo?._id || task?.assignedTo;
    io.to(`user:${assigneeId}`).emit(eventName, payload);
  }

  // Notify the team lead
  if (task?.teamLeadId?._id || task?.teamLeadId) {
    const teamLeadId = task?.teamLeadId?._id || task?.teamLeadId;
    io.to(`user:${teamLeadId}`).emit(eventName, payload);
  }

  // Notify all managers
  io.to("role:manager").emit(eventName, payload);
};

module.exports = { initSocket, emitTaskEvent };
