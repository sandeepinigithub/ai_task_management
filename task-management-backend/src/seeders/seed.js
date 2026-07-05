require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const connectDB = require("../../config/db");
const { User } = require("../models");

const MANAGER = {
  username: "Manager Sandeep",
  email: "manager@yopmail.com",
  password: "Password@123",
  role: "manager",
};

const seed = async () => {
  await connectDB();

  console.log("Running seeder...\n");

  // Upsert manager (won't duplicate on re-run)
  const existing = await User.findOne({ email: MANAGER.email });

  if (existing) {
    console.log(`Manager already exists: ${existing.email} (skipping insert)`);
    await mongoose.disconnect();
    return;
  }

  const manager = await User.create({
    username: MANAGER.username,
    email: MANAGER.email,
    password: MANAGER.password,
    role: MANAGER.role,
    isActive: true,
  });

  console.log("Manager seeded successfully");
  console.log(`   Name  : ${manager.username}`);
  console.log(`   Email : ${manager.email}`);
  console.log(`   Role  : ${manager.role}`);
  console.log(`   ID    : ${manager._id}`);
  await mongoose.disconnect();
  console.log("Database disconnected. Done.\n");
};

seed().catch((err) => {
  console.error("Seeder failed:", err.message);
  process.exit(1);
});
