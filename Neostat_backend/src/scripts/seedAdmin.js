import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const fullName = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!fullName || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured in .env"
      );
    }

    if (password.length < 8) {
      throw new Error("Admin password must be at least 8 characters");
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.fullName = fullName;
      existingAdmin.role = "ADMIN";
      existingAdmin.isActive = true;

      // Do not reset the existing password during repeated seed runs.
      await existingAdmin.save();

      console.log(`Admin account updated: ${email}`);
    } else {
      await User.create({
        fullName,
        email,
        password,
        role: "ADMIN",
        isActive: true,
      });

      console.log(`Admin account created: ${email}`);
    }
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();