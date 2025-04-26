const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Serve static files from parent directory (where index.html is)
app.use(express.static(path.join(__dirname, "..")));

// Set up EJS with layouts
app.use(expressLayouts);
app.set("layout", path.join(__dirname, "views/layout"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/luxtripperdatabase"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import Routes
const authRoutes = require("./routes/auth");
const sectionRoutes = require("./routes/sections");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/public", publicRoutes);

// Admin Panel Routes
app.use("/admin", adminRoutes);

// Frontend route
app.get("/", (req, res) => {
  // Serve the index.html file from the parent directory
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Route to admin panel login
app.get("/admin", (req, res) => {
  res.redirect("/admin/login");
});

// Catch-all route for API 404 errors
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong on the server",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
