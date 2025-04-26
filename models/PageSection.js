const mongoose = require("mongoose");

const pageSectionSchema = new mongoose.Schema(
  {
    pageId: {
      type: String,
      required: true,
      trim: true,
      // This will be the page filename (e.g., "about" for about.html)
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["text", "image", "gallery", "video", "form", "map", "custom"],
      default: "text",
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    styles: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    classes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Create indexes for better performance
pageSectionSchema.index({ pageId: 1 });
pageSectionSchema.index({ order: 1 });

const PageSection = mongoose.model("PageSection", pageSectionSchema);

module.exports = PageSection;
