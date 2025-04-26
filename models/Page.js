const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    templateType: {
      type: String,
      enum: ["attraction", "things-to-do", "event", "restaurant", "hotel"],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    filePath: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Create indexes for better performance
pageSchema.index({ slug: 1 });
pageSchema.index({ templateType: 1 });
pageSchema.index({ isPublished: 1 });

const Page = mongoose.model("Page", pageSchema);

module.exports = Page;
