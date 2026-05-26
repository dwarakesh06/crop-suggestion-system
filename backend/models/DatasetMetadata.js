const mongoose = require("mongoose");

const DatasetMetadataSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recordCount: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0.0
  },
  status: {
    type: String,
    enum: ["uploaded", "training", "trained", "failed"],
    default: "uploaded"
  },
  trainedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("DatasetMetadata", DatasetMetadataSchema);
