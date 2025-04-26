const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Section = require("../models/Section");
const { authenticate } = require("../middleware/auth");

// Set up multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Base uploads directory
      const baseUploadsDir = process.env.UPLOADS_DIR || "public/uploads";

      // Ensure base directory exists
      if (!fs.existsSync(baseUploadsDir)) {
        fs.mkdirSync(baseUploadsDir, { recursive: true });
      }

      // Default destination is the base uploads directory
      let uploadDestination = baseUploadsDir;

      // If we have a section ID, try to organize by section
      const sectionId = req.params.id;
      if (sectionId) {
        try {
          // Get section info
          const section = await Section.findById(sectionId);
          if (section) {
            // Create a clean folder name
            const sectionFolder = section.name
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-");

            // Create section-specific directory
            const sectionDir = path.join(baseUploadsDir, sectionFolder);
            if (!fs.existsSync(sectionDir)) {
              fs.mkdirSync(sectionDir, { recursive: true });
            }

            // If we have a content type, create a subdirectory for it
            if (req.query.type) {
              const typeFolder = req.query.type
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-");
              const typeDir = path.join(sectionDir, typeFolder);

              if (!fs.existsSync(typeDir)) {
                fs.mkdirSync(typeDir, { recursive: true });
              }

              uploadDestination = typeDir;
            } else {
              uploadDestination = sectionDir;
            }
          }
        } catch (err) {
          console.error("Error creating section directory:", err);
        }
      }

      // Store the destination path on the file object
      file.destination = uploadDestination;
      cb(null, uploadDestination);
    } catch (err) {
      console.error("Error setting upload destination:", err);
      // Fallback to base uploads dir
      const baseDir = process.env.UPLOADS_DIR || "public/uploads";
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
      file.destination = baseDir;
      cb(null, baseDir);
    }
  },
  filename: async (req, file, cb) => {
    try {
      // Get section ID from request params
      const sectionId = req.params.id;

      // Get file extension
      const fileExt = path.extname(file.originalname).toLowerCase();

      // Default filename format (fallback)
      let baseName = "image";
      let counter = 1;

      if (sectionId) {
        // Try to get the section from database
        try {
          const section = await Section.findById(sectionId);
          if (section) {
            // Get simple section name (e.g., hero, history)
            baseName = section.name.toLowerCase().replace(/[^a-z0-9]/g, "");

            // Add content type suffix if provided
            if (req.query.type) {
              // Clean content type
              const contentType = req.query.type
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "");

              // If it's a deck with number, extract the number
              const deckMatch = contentType.match(/deck-(\d+)/);
              if (deckMatch) {
                baseName = `${baseName}-deck${deckMatch[1]}`;
              }
              // For background images
              else if (contentType === "background") {
                baseName = `${baseName}-bg`;
              }
              // For other content types (keep it short)
              else if (contentType !== "general") {
                baseName = `${baseName}-${contentType.substring(0, 3)}`;
              }
            }

            // Get the destination directory that was set in the destination function
            const destDir = file.destination;

            // Find existing files with similar names to determine the next counter
            if (destDir && fs.existsSync(destDir)) {
              const files = fs.readdirSync(destDir);

              // Get the highest counter for this base name
              const regex = new RegExp(`^${baseName}(\\d+)\\.[a-z]+$`, "i");

              let highestCounter = 0;
              files.forEach((file) => {
                const match = file.match(regex);
                if (match && match[1]) {
                  const fileCounter = parseInt(match[1], 10);
                  if (fileCounter > highestCounter) {
                    highestCounter = fileCounter;
                  }
                }
              });

              // Set counter to next available number
              counter = highestCounter + 1;
            }
          }
        } catch (err) {
          console.error("Error getting section for filename:", err);
        }
      }

      // Create a simple, readable filename with counter
      const newFilename = `${baseName}${counter}${fileExt}`;
      console.log(`Generated filename: ${newFilename}`);

      cb(null, newFilename);
    } catch (err) {
      // Fallback to a simple unique name if there's an error
      const fallbackName = `img${Date.now()}${path.extname(file.originalname)}`;
      console.error("Error creating filename:", err);
      cb(null, fallbackName);
    }
  },
});

// Set up file filter for uploads
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @route   GET /api/sections
// @desc    Get all sections
// @access  Private
router.get("/", authenticate, async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1 });
    res.json({ success: true, sections });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/sections/:id
// @desc    Get section by ID
// @access  Private
router.get("/:id", authenticate, async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    res.json({ success: true, section });
  } catch (err) {
    console.error(err.message);

    // Check if error is due to invalid ObjectId
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/sections
// @desc    Create a new section
// @access  Private
router.post(
  "/",
  authenticate,
  [
    body("name").not().isEmpty().withMessage("Section name is required"),
    body("displayName").not().isEmpty().withMessage("Display name is required"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, displayName, icon, order, content } = req.body;

      // Check if section already exists
      const existingSection = await Section.findOne({ name });
      if (existingSection) {
        return res
          .status(400)
          .json({ success: false, message: "Section already exists" });
      }

      // Create new section
      const newSection = new Section({
        name,
        displayName,
        icon: icon || "fas fa-edit",
        order: order || 0,
        updatedBy: req.user.id,
        content: content || {},
      });

      // Save section to database
      const section = await newSection.save();

      res.status(201).json({ success: true, section });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// @route   PUT /api/sections/:id
// @desc    Update a section
// @access  Private
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { displayName, icon, order, isActive, content } = req.body;

    // Build update object
    const updateFields = {};
    if (displayName) updateFields.displayName = displayName;
    if (icon) updateFields.icon = icon;
    if (order !== undefined) updateFields.order = order;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (content) updateFields.content = content;

    // Set updated user and time
    updateFields.updatedBy = req.user.id;
    updateFields.lastUpdated = Date.now();

    // Find and update section
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    res.json({ success: true, section });
  } catch (err) {
    console.error(err.message);

    // Check if error is due to invalid ObjectId
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/sections/:id/upload
// @desc    Upload image for a section
// @access  Private
router.post(
  "/:id/upload",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      // Get section
      const section = await Section.findById(req.params.id);

      if (!section) {
        // Remove uploaded file if section not found
        fs.unlinkSync(req.file.path);
        return res
          .status(404)
          .json({ success: false, message: "Section not found" });
      }

      // Get file path relative to the public directory for serving via HTTP
      const filePath = req.file.path.replace(/^public/, "");

      // Get content type from query params if provided
      const contentType = req.query.type || "general";

      // Store additional metadata about the upload
      const imageData = {
        path: filePath,
        originalName: req.file.originalname,
        uploadedAt: Date.now(),
        contentType: contentType, // Store what kind of content this image is for
        sectionName: section.name,
        filename: req.file.filename,
      };

      // Add image to section content images array (create if doesn't exist)
      if (!section.content.images) {
        section.content.images = [];
      }

      section.content.images.push(imageData);

      // Update section with new image
      section.updatedBy = req.user.id;
      section.lastUpdated = Date.now();

      await section.save();

      res.json({
        success: true,
        file: {
          filename: req.file.filename,
          path: filePath,
          fullPath: `/${req.file.path.replace(/\\/g, "/")}`, // Replace backslashes with forward slashes for URLs
          contentType: contentType,
          metadata: imageData,
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

// @route   DELETE /api/sections/:id
// @desc    Delete a section
// @access  Private
router.delete("/:id", authenticate, async (req, res) => {
  try {
    // Find section
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    // Delete section
    await Section.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Section removed" });
  } catch (err) {
    console.error(err.message);

    // Check if error is due to invalid ObjectId
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/sections/reorder
// @desc    Reorder multiple sections
// @access  Private
router.put("/reorder", authenticate, async (req, res) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sections data" });
    }

    // Update each section's order
    const updatePromises = sections.map(({ id, order }) => {
      return Section.findByIdAndUpdate(id, {
        $set: {
          order,
          updatedBy: req.user.id,
          lastUpdated: Date.now(),
        },
      });
    });

    await Promise.all(updatePromises);

    // Fetch updated sections
    const updatedSections = await Section.find().sort({ order: 1 });

    res.json({ success: true, sections: updatedSections });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
