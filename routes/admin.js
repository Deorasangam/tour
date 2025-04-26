const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const User = require("../models/User");
const Section = require("../models/Section");
const { authenticate, isAdmin } = require("../middleware/auth");

// Use the admin signup code from environment variables
const ADMIN_SIGNUP_CODE = process.env.ADMIN_SIGNUP_CODE || "admin2024";

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = process.env.UPLOADS_DIR || "public/uploads";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp + original filename to avoid conflicts
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + "-" + file.originalname);
  },
});

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Login page
router.get("/login", (req, res) => {
  const message = req.query.message || "";
  res.render("pages/login", { message });
});

// Signup page
router.get("/signup", (req, res) => {
  res.render("pages/signup", { message: "" });
});

// Handle signup form submission
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, signupCode } = req.body;

    // Basic validation
    if (!name || !email || !password || !confirmPassword || !signupCode) {
      return res.render("pages/signup", { message: "All fields are required" });
    }

    // Validate signup code
    if (signupCode !== ADMIN_SIGNUP_CODE) {
      return res.render("pages/signup", { message: "Invalid signup code" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render("pages/signup", { message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("pages/signup", { message: "Email already in use" });
    }

    // Create new admin user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
      role: "admin", // Make all signed up users admins
      isActive: true,
    });

    await newUser.save();

    res.redirect(
      "/admin/login?message=Account created successfully. Please log in"
    );
  } catch (err) {
    console.error("Signup error:", err);
    res.render("pages/signup", { message: "An error occurred during signup" });
  }
});

// Login form submission
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("pages/login", { message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.render("pages/login", {
        message: "Your account has been deactivated",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render("pages/login", { message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Set cookie with token (updated settings)
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err.message);
    res.render("pages/login", {
      message: "An error occurred, please try again",
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/login");
});

// Dashboard
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    // Get all sections
    const sections = await Section.find().sort({ order: 1 });

    // Count users if admin
    let userCount = 0;
    if (req.user.role === "admin") {
      userCount = await User.countDocuments();
    }

    res.render("pages/dashboard", {
      user: req.user,
      sections,
      userCount,
      activePage: "dashboard",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading dashboard" });
  }
});

// Sections management
router.get("/sections", authenticate, async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/sections", {
      user: req.user,
      sections,
      activePage: "sections",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading sections" });
  }
});

// Edit section page
router.get("/sections/:id", authenticate, async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.render("pages/error", { message: "Section not found" });
    }

    const allSections = await Section.find().sort({ order: 1 });

    res.render("pages/edit-section", {
      user: req.user,
      section,
      sections: allSections,
      activePage: "sections",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading section" });
  }
});

// Create section page
router.get("/sections/create", authenticate, async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/create-section", {
      user: req.user,
      sections,
      activePage: "sections",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading page" });
  }
});

// User management (admin only)
router.get("/users", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/users", {
      user: req.user,
      currentUser: req.user,
      users,
      sections,
      activePage: "users",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading users" });
  }
});

// Create user page (admin only)
router.get("/users/create", authenticate, isAdmin, async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/create-user", {
      user: req.user,
      sections,
      activePage: "users",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading page" });
  }
});

// Edit user page (admin only)
router.get("/users/:id/edit", authenticate, isAdmin, async (req, res) => {
  try {
    const userToEdit = await User.findById(req.params.id);

    if (!userToEdit) {
      return res.render("pages/error", { message: "User not found" });
    }

    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/edit-user", {
      user: req.user,
      currentUser: req.user,
      userToEdit,
      sections,
      activePage: "users",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading user" });
  }
});

// View user profile (admin only)
router.get("/users/:id/view", authenticate, isAdmin, async (req, res) => {
  try {
    const userToView = await User.findById(req.params.id);

    if (!userToView) {
      return res.render("pages/error", { message: "User not found" });
    }

    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/view-user", {
      user: req.user,
      currentUser: req.user,
      userToView,
      sections,
      activePage: "users",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading user" });
  }
});

// Profile page
router.get("/profile", authenticate, async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/profile", {
      user: req.user,
      sections,
      activePage: "profile",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading profile" });
  }
});

// Update profile (for current user)
router.post("/profile", authenticate, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword, updateType } = req.body;

    // Get user from database to get current password hash
    const user = await User.findById(req.user.id);

    // Handle profile update type (basic info or password change)
    if (updateType === "password") {
      // Password change - verify current password first
      if (!currentPassword || !newPassword) {
        return res.render("pages/profile", {
          user: req.user,
          error: "Both current and new password are required",
          success: "",
          activePage: "profile",
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.render("pages/profile", {
          user: req.user,
          error: "Current password is incorrect",
          success: "",
          activePage: "profile",
          hash: "#security", // Ensure we return to the security tab
        });
      }

      // Password length validation
      if (newPassword.length < 6) {
        return res.render("pages/profile", {
          user: req.user,
          error: "New password must be at least 6 characters long",
          success: "",
          activePage: "profile",
          hash: "#security", // Ensure we return to the security tab
        });
      }

      // Set new password
      user.password = newPassword;
      await user.save();

      // Create new token with updated info
      const token = jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      // Set token cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      // Get sections for rendering
      const sections = await Section.find().sort({ order: 1 });

      return res.render("pages/profile", {
        user: { ...user.toObject(), password: undefined },
        error: "",
        success: "Password updated successfully",
        sections,
        activePage: "profile",
        hash: "#security", // Ensure we return to the security tab
      });
    } else {
      // Basic profile info update
      if (name) user.name = name;
      if (email) user.email = email;

      await user.save();

      // Create new token with updated info
      const token = jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      // Set token cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      // Get sections for rendering
      const sections = await Section.find().sort({ order: 1 });

      return res.render("pages/profile", {
        user: { ...user.toObject(), password: undefined },
        error: "",
        success: "Profile updated successfully",
        sections,
        activePage: "profile",
        hash: "#edit", // Ensure we return to the edit tab
      });
    }
  } catch (err) {
    console.error(err.message);

    // Get sections for rendering the page
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/profile", {
      user: req.user,
      error: "Error updating profile: " + err.message,
      success: "",
      sections,
      activePage: "profile",
    });
  }
});

// Image upload for WYSIWYG editor
router.post(
  "/upload-image",
  authenticate,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      // Get file path relative to the public directory for serving via HTTP
      const filePath = req.file.path.replace(/^public/, "");

      // Return file info for the editor
      res.json({
        success: true,
        file: {
          url: `/${req.file.path.replace(/\\/g, "/")}`, // Replace backslashes with forward slashes for URLs
          filename: req.file.filename,
        },
      });
    } catch (err) {
      console.error(err.message);

      // Delete uploaded file if there's an error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Create new page from template
router.post("/create-page", authenticate, async (req, res) => {
  try {
    const { pageName, templateType } = req.body;

    if (!pageName) {
      return res.status(400).json({
        success: false,
        message: "Page name is required",
      });
    }

    if (!templateType) {
      return res.status(400).json({
        success: false,
        message: "Template type is required",
      });
    }

    // Clean the page name (remove spaces, special characters)
    const cleanPageName = pageName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-"); // Replace multiple hyphens with a single one

    // Add .html extension if not present
    const fileName = cleanPageName.endsWith(".html")
      ? cleanPageName
      : `${cleanPageName}.html`;

    // Define paths
    const templatePath = path.join(
      __dirname,
      `../views/templates/${templateType}.html`
    );
    const pagesDir = path.join(__dirname, "../../pages");
    const newPagePath = path.join(pagesDir, fileName);

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(400).json({
        success: false,
        message: `Template "${templateType}" does not exist`,
      });
    }

    // Create the pages directory if it doesn't exist
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    // Check if the file already exists
    if (fs.existsSync(newPagePath)) {
      return res.status(400).json({
        success: false,
        message: `A page with the name ${fileName} already exists`,
      });
    }

    // Copy the template file to the new file
    fs.copyFileSync(templatePath, newPagePath);

    // Read the file and fix the CSS path
    let fileContent = fs.readFileSync(newPagePath, "utf8");

    // Replace the CSS path to point to the correct location
    fileContent = fileContent.replace(
      /<link rel="stylesheet" href="\/public\/css\/templates.css" \/>/,
      '<link rel="stylesheet" href="/public/css/templates.css" />'
    );

    // Write the updated content back to the file
    fs.writeFileSync(newPagePath, fileContent, "utf8");

    return res.json({
      success: true,
      message: `Page "${fileName}" has been created successfully`,
      fileName: fileName,
      path: `/pages/${fileName}`, // Path relative to website root
    });
  } catch (err) {
    console.error("Error creating page:", err);
    return res.status(500).json({
      success: false,
      message: "Error creating page",
    });
  }
});

// Route to display page creation form
router.get("/create-page", authenticate, async (req, res) => {
  try {
    // Get sections for sidebar navigation
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/create-page", {
      user: req.user,
      sections,
      activePage: "create-page",
      message: "",
    });
  } catch (err) {
    console.error(err.message);
    res.render("pages/error", { message: "Error loading page creation form" });
  }
});

// Serve template files for preview
router.get("/views/templates/:template", authenticate, (req, res) => {
  const templateName = req.params.template;
  const templatePath = path.join(__dirname, "../views/templates", templateName);
  const fallbackPath = path.join(
    __dirname,
    "../views/templates/fallback-template.html"
  );

  // Check if the file exists
  if (fs.existsSync(templatePath)) {
    res.sendFile(templatePath);
  } else {
    // If the specific template isn't found, serve the fallback template
    if (fs.existsSync(fallbackPath)) {
      console.log(`Template ${templateName} not found, serving fallback`);
      res.sendFile(fallbackPath);
    } else {
      res
        .status(404)
        .send(
          `Template ${templateName} not found and fallback template is also missing`
        );
    }
  }
});

// Route for editing an existing page
router.get("/edit-page/:pageName", authenticate, async (req, res) => {
  try {
    const pageName = req.params.pageName;
    const pageFilePath = path.join(
      __dirname,
      "../../pages",
      `${pageName}.html`
    );

    // Check if the page exists
    if (!fs.existsSync(pageFilePath)) {
      return res.render("pages/error", {
        message: `Page "${pageName}.html" not found`,
      });
    }

    // Read the HTML content of the page
    const pageContent = fs.readFileSync(pageFilePath, "utf8");

    // Get sections for sidebar navigation
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/edit-page", {
      user: req.user,
      sections,
      activePage: "edit-page",
      pageName: pageName,
      pageContent: pageContent,
      message: "",
    });
  } catch (err) {
    console.error("Error loading page for editing:", err);
    res.render("pages/error", { message: "Error loading page for editing" });
  }
});

// Route to list all existing pages
router.get("/pages", authenticate, async (req, res) => {
  try {
    const pagesDir = path.join(__dirname, "../../pages");

    // Check if pages directory exists
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    // Read all HTML files in the pages directory
    const files = fs
      .readdirSync(pagesDir)
      .filter((file) => file.endsWith(".html"))
      .map((file) => {
        const filePath = path.join(pagesDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          baseName: file.replace(".html", ""),
          path: `/pages/${file}`,
          size: stats.size,
          lastModified: stats.mtime,
        };
      })
      .sort((a, b) => b.lastModified - a.lastModified); // Sort by most recently modified

    // Get sections for sidebar navigation
    const sections = await Section.find().sort({ order: 1 });

    res.render("pages/manage-pages", {
      user: req.user,
      sections,
      activePage: "pages",
      pages: files,
      message: "",
    });
  } catch (err) {
    console.error("Error loading pages:", err);
    res.render("pages/error", { message: "Error loading pages" });
  }
});

// Route for saving edited page
router.post("/edit-page/:pageName", authenticate, async (req, res) => {
  try {
    const pageName = req.params.pageName;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Page content is required",
      });
    }

    const pageFilePath = path.join(
      __dirname,
      "../../pages",
      `${pageName}.html`
    );

    // Check if the page exists
    if (!fs.existsSync(pageFilePath)) {
      return res.status(404).json({
        success: false,
        message: `Page "${pageName}.html" not found`,
      });
    }

    // Write the updated content to the file
    fs.writeFileSync(pageFilePath, content, "utf8");

    // Return success response
    return res.json({
      success: true,
      message: `Page "${pageName}.html" has been updated successfully`,
      path: `/pages/${pageName}.html`,
    });
  } catch (err) {
    console.error("Error saving edited page:", err);
    return res.status(500).json({
      success: false,
      message: "Error saving page: " + err.message,
    });
  }
});

// Route for deleting a page
router.delete("/delete-page/:pageName", authenticate, async (req, res) => {
  try {
    const pageName = req.params.pageName;
    const pageFilePath = path.join(
      __dirname,
      "../../pages",
      `${pageName}.html`
    );

    // Check if the page exists
    if (!fs.existsSync(pageFilePath)) {
      return res.status(404).json({
        success: false,
        message: `Page "${pageName}.html" not found`,
      });
    }

    // Delete the file
    fs.unlinkSync(pageFilePath);

    return res.json({
      success: true,
      message: `Page "${pageName}.html" has been deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting page:", err);
    return res.status(500).json({
      success: false,
      message: "Error deleting page",
    });
  }
});

module.exports = router;
