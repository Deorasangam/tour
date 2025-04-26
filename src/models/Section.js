const mongoose = require("mongoose");

// Schema for different section types
const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "fas fa-edit", // Default icon
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
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Create indexes for better performance
sectionSchema.index({ name: 1 });
sectionSchema.index({ order: 1 });

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
