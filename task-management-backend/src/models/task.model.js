const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const TASK_STATUSES = ["pending", "inprogress", "completed"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must not exceed 1000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: "Status must be one of: pending, inprogress, completed",
      },
      default: "pending",
    },
    // Who the task is assigned to
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must be assigned to a user"],
    },
    // Who created the task
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must have a creator"],
    },
    // Team lead responsible for this task (for hierarchy tracking)
    teamLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ teamLeadId: 1 });

taskSchema.plugin(mongoosePaginate);
taskSchema.plugin(mongooseAggregatePaginate);

taskSchema.statics.TASK_STATUSES = TASK_STATUSES;

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
