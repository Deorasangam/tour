const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { authenticate, isAdmin } = require("../middleware/auth");

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Admin only
router.post(
  "/register",
  authenticate,
  isAdmin,
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["admin", "editor"])
      .withMessage("Role must be either admin or editor"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
        role: role || "editor", // Default to editor if not specified
      });

      // Save user to database
      await user.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res
          .status(401)
          .json({
            success: false,
            message: "Your account has been deactivated",
          });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Create and return JWT token
      const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Admin only
router.get("/users", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user
// @access  Admin only
router.put("/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete user
// @access  Admin only
router.delete("/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    // Check if user is trying to delete themselves
    if (req.params.id === req.user.id.toString()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot delete your own account",
        });
    }

    // Find and delete user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
