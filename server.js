const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const { authenticateToken } = require("./middleware/auth");

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
// Serve pages directory
app.use("/pages", express.static(path.join(__dirname, "pages")));

// Set up EJS with layouts
app.use(expressLayouts);
app.set("layout", path.join(__dirname, "views/layouts/layout"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Import and use API routes
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// Middleware to inject Edit Content button for authenticated users
app.use(async (req, res, next) => {
  // Only process HTML files in the pages directory
  if (req.path.startsWith("/pages/") && req.path.endsWith(".html")) {
    try {
      // Check if user is authenticated
      const user = await authenticateToken(req);

      if (user) {
        // User is authenticated, inject the edit button
        const fs = require("fs");
        const pagePath = path.join(__dirname, "..", req.path);

        if (fs.existsSync(pagePath)) {
          let content = fs.readFileSync(pagePath, "utf8");
          const pageName = path.basename(req.path, ".html");

          // Create edit button HTML
          const editButton = `
            <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
              <a href="/admin/edit-page/${pageName}" class="btn btn-primary" style="background-color: #007bff; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                <i class="fas fa-edit"></i> Edit Content
              </a>
            </div>
          `;

          // Insert the button before the closing body tag
          content = content.replace("</body>", editButton + "</body>");

          // Send the modified content
          res.send(content);
          return;
        }
      }
    } catch (err) {
      console.error("Error in edit button middleware:", err);
      // Continue with normal processing even if there's an error
    }
  }

  next();
});

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
const pageRoutes = require("./routes/pageRoutes");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/pages", pageRoutes);

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
