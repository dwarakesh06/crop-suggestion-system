const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Allow guest users if applicable, but we track logged-in users
  },
  inputs: {
    N: { type: Number, required: true },
    P: { type: Number, required: true },
    K: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    ph: { type: Number, required: true },
    rainfall: { type: Number, required: true }
  },
  predictedCrop: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  fertilizerRecommendation: {
    status: { type: String, required: true },
    details: [
      {
        nutrient: { type: String },
        status: { type: String },
        message: { type: String },
        remedy: { type: String }
      }
    ]
  },
  yieldEstimation: {
    minYield: { type: Number, required: true },
    maxYield: { type: Number, required: true },
    unit: { type: String, default: "tons per hectare" },
    explanation: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Prediction", PredictionSchema);
