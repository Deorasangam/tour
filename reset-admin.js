const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./models/User");

// Load environment variables
dotenv.config();

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/luxtripperdatabase"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Default admin details (customize these)
const DEFAULT_ADMIN = {
  name: "Admin",
  email: "admin@example.com",
  password: "admin123", // This will be hashed
  role: "admin",
  isActive: true,
};

const resetAdmin = async () => {
  try {
    // Check if admin user exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log(`Existing admin found: ${existingAdmin.email}`);

      // Update password for existing admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);

      existingAdmin.password = hashedPassword;
      existingAdmin.isActive = true;
      await existingAdmin.save();

      console.log(
        `Admin password reset successfully for ${existingAdmin.email}`
      );
      console.log(`New password: ${DEFAULT_ADMIN.password}`);
    } else {
      // Create new admin user if none exists
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);

      const newAdmin = new User({
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });

      await newAdmin.save();

      console.log("New admin user created successfully:");
      console.log(`Email: ${DEFAULT_ADMIN.email}`);
      console.log(`Password: ${DEFAULT_ADMIN.password}`);
    }

    console.log("\nPlease use these credentials to login to the admin panel.");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error resetting admin:", error);
    mongoose.disconnect();
  }
};

// Run the reset function
resetAdmin();
