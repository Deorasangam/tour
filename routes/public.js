const express = require("express");
const router = express.Router();
const Section = require("../models/Section");
const path = require("path");
const fs = require("fs");

// @route   GET /api/public/sections
// @desc    Get all active sections for public consumption
// @access  Public
router.get("/sections", async (req, res) => {
  try {
    const sections = await Section.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, sections });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/public/sections/:name
// @desc    Get section by name for public consumption
// @access  Public
router.get("/sections/:name", async (req, res) => {
  try {
    const section = await Section.findOne({
      name: req.params.name,
      isActive: true,
    });

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    res.json({ success: true, section });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
