const express = require("express");
const router = express.Router();
const PageSection = require("../models/PageSection");
const { authenticate } = require("../middleware/auth");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

// Get all sections for a page
router.get("/:pageId", authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    const sections = await PageSection.find({ pageId }).sort({ order: 1 });

    res.json({ success: true, sections });
  } catch (err) {
    console.error("Error getting page sections:", err);
    res.status(500).json({
      success: false,
      message: "Error getting page sections",
    });
  }
});

// Create a new section for a page
router.post("/:pageId", authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { title, type, content = {}, order } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: "Section title and type are required",
      });
    }

    // Get last section order if not provided
    let sectionOrder = order;
    if (sectionOrder === undefined) {
      const lastSection = await PageSection.findOne({ pageId }).sort({
        order: -1,
      });

      sectionOrder = lastSection ? lastSection.order + 1 : 0;
    }

    // Create new section
    const newSection = new PageSection({
      pageId,
      title,
      type,
      content,
      order: sectionOrder,
      updatedBy: req.user._id,
    });

    await newSection.save();

    res.json({
      success: true,
      message: "Section created successfully",
      section: newSection,
    });
  } catch (err) {
    console.error("Error creating section:", err);
    res.status(500).json({
      success: false,
      message: "Error creating section",
    });
  }
});

// Update a section
router.put("/:sectionId", authenticate, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, content, isActive, order, styles, classes } = req.body;

    const section = await PageSection.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Update fields
    if (title !== undefined) section.title = title;
    if (content !== undefined) section.content = content;
    if (isActive !== undefined) section.isActive = isActive;
    if (order !== undefined) section.order = order;
    if (styles !== undefined) section.styles = styles;
    if (classes !== undefined) section.classes = classes;

    section.lastUpdated = Date.now();
    section.updatedBy = req.user._id;

    await section.save();

    res.json({
      success: true,
      message: "Section updated successfully",
      section,
    });
  } catch (err) {
    console.error("Error updating section:", err);
    res.status(500).json({
      success: false,
      message: "Error updating section",
    });
  }
});

// Delete a section
router.delete("/:sectionId", authenticate, async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await PageSection.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    await PageSection.findByIdAndDelete(sectionId);

    res.json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting section:", err);
    res.status(500).json({
      success: false,
      message: "Error deleting section",
    });
  }
});

// Update section order
router.post("/:pageId/reorder", authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { sectionOrder } = req.body;

    if (!Array.isArray(sectionOrder)) {
      return res.status(400).json({
        success: false,
        message: "sectionOrder must be an array of section IDs",
      });
    }

    // Update order for each section
    const updatePromises = sectionOrder.map((sectionId, index) => {
      return PageSection.findByIdAndUpdate(sectionId, {
        order: index,
        lastUpdated: Date.now(),
        updatedBy: req.user._id,
      });
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "Sections reordered successfully",
    });
  } catch (err) {
    console.error("Error reordering sections:", err);
    res.status(500).json({
      success: false,
      message: "Error reordering sections",
    });
  }
});

// Render section preview
router.post("/preview", authenticate, async (req, res) => {
  try {
    const { type, content } = req.body;

    // Path to section template
    const templatePath = path.join(
      __dirname,
      "../views/section-templates",
      `${type}.ejs`
    );

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: `Template for section type "${type}" not found`,
      });
    }

    // Read template file
    const template = fs.readFileSync(templatePath, "utf8");

    // Render section with EJS
    const renderedSection = ejs.render(template, {
      content,
      user: req.user,
    });

    res.json({
      success: true,
      renderedHtml: renderedSection,
    });
  } catch (err) {
    console.error("Error rendering section preview:", err);
    res.status(500).json({
      success: false,
      message: "Error rendering section preview",
    });
  }
});

// Render full page with sections
router.get("/:pageId/render", authenticate, async (req, res) => {
  try {
    const { pageId } = req.params;

    // Get all active sections for the page
    const sections = await PageSection.find({
      pageId,
      isActive: true,
    }).sort({ order: 1 });

    // Get base page template
    const pageFilePath = path.join(__dirname, "../../pages", `${pageId}.html`);

    if (!fs.existsSync(pageFilePath)) {
      return res.status(404).json({
        success: false,
        message: `Page "${pageId}.html" not found`,
      });
    }

    let pageContent = fs.readFileSync(pageFilePath, "utf8");

    // Placeholder where dynamic sections will be inserted
    const sectionPlaceholder = "<!-- DYNAMIC_SECTIONS_PLACEHOLDER -->";

    // Check if placeholder exists, otherwise add it before </body>
    if (!pageContent.includes(sectionPlaceholder)) {
      pageContent = pageContent.replace(
        "</body>",
        `${sectionPlaceholder}\n</body>`
      );
    }

    // Render each section
    const renderedSections = await Promise.all(
      sections.map(async (section) => {
        const templatePath = path.join(
          __dirname,
          "../views/section-templates",
          `${section.type}.ejs`
        );

        // If template doesn't exist, render a basic section
        if (!fs.existsSync(templatePath)) {
          return `<div data-section-id="${
            section._id
          }" class="dynamic-section ${section.classes}">
          <h2>${section.title}</h2>
          <div>${JSON.stringify(section.content)}</div>
        </div>`;
        }

        const template = fs.readFileSync(templatePath, "utf8");

        try {
          return ejs.render(template, {
            section,
            content: section.content,
            styles: section.styles,
            classes: section.classes,
            user: req.user,
          });
        } catch (renderErr) {
          console.error(`Error rendering section ${section._id}:`, renderErr);
          return `<div data-section-id="${section._id}" class="section-error">
          <h2>${section.title}</h2>
          <div>Error rendering section</div>
        </div>`;
        }
      })
    );

    // Join all rendered sections
    const sectionsHtml = renderedSections.join("\n");

    // Replace placeholder with rendered sections
    const fullPage = pageContent.replace(sectionPlaceholder, sectionsHtml);

    res.json({
      success: true,
      pageContent: fullPage,
    });
  } catch (err) {
    console.error("Error rendering page with sections:", err);
    res.status(500).json({
      success: false,
      message: "Error rendering page with sections",
    });
  }
});

module.exports = router;
