const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const ROLES = ["manager", "teamlead", "employee"];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must not exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: "Role must be one of: manager, teamlead, employee",
      },
      default: "employee",
    },
    // For employees: reference to their team lead
    teamLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // For team leads: reference to their manager
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.plugin(mongoosePaginate);
userSchema.plugin(mongooseAggregatePaginate);

userSchema.statics.ROLES = ROLES;

const User = mongoose.model("User", userSchema);

module.exports = User;
