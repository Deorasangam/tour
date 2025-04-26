const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to authenticate JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header, cookie, or query parameter
    const token =
      req.header("x-auth-token") || req.cookies?.token || req.query.token;

    // Debug info (remove in production)
    console.log("Auth check for:", req.originalUrl);
    console.log("Token exists:", !!token);

    // Check if no token
    if (!token) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      } else {
        return res.redirect(
          "/admin/login?message=Please log in to access this page"
        );
      }
    }

    // Verify token with more specific error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified successfully for user:", decoded.id);
    } catch (tokenError) {
      console.error("Token verification error:", tokenError.message);
      if (tokenError.name === "TokenExpiredError") {
        return res.redirect(
          "/admin/login?message=Your session has expired. Please log in again."
        );
      } else {
        return res.redirect(
          "/admin/login?message=Authentication failed. Please log in again."
        );
      }
    }

    // Find user by id
    const user = await User.findById(decoded.id).select("-password");

    // Check if user exists
    if (!user || !user.isActive) {
      console.log("User not found or inactive:", decoded.id);
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user is inactive",
        });
      } else {
        return res.redirect(
          "/admin/login?message=Your account is inactive or invalid"
        );
      }
    }

    // Set user in request
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      return res.redirect(
        "/admin/login?message=Session expired, please log in again"
      );
    }
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  if (req.originalUrl.startsWith("/api/")) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  } else {
    return res.status(403).render("pages/error", {
      message: "Access denied. You need admin privileges to access this page.",
    });
  }
};

// Function to authenticate token without redirecting (for middleware use)
exports.authenticateToken = async (req) => {
  try {
    // Get token from cookie
    const token = req.cookies?.token;

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (err) {
    console.error("Token authentication error:", err.message);
    return null;
  }
};
