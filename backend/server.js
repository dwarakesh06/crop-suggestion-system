const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config();

// Controllers & Middlewares
const authController = require("./controllers/authController");
const predictController = require("./controllers/predictController");
const adminController = require("./controllers/adminController");
const { protect, optionalProtect, admin } = require("./middleware/auth");
const upload = require("./middleware/upload");
const errorHandler = require("./middleware/error");

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Node.js Backend Server is running smoothly",
    timestamp: new Date()
  });
});

// Auth Routes
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);
app.get("/api/auth/me", protect, authController.getMe);

// Prediction Routes
app.post("/api/predict", optionalProtect, predictController.predictCrop);
app.get("/api/history", protect, predictController.getHistory);

// Admin Routes
app.get("/api/admin/stats", protect, admin, adminController.getSystemStats);
app.get("/api/admin/users", protect, admin, adminController.getUsers);
app.delete("/api/admin/users/:id", protect, admin, adminController.deleteUser);
app.get("/api/admin/predictions", protect, admin, adminController.getAllPredictions);
app.delete("/api/admin/predictions/:id", protect, admin, adminController.deletePrediction);
app.post("/api/admin/dataset-upload", protect, admin, upload.single("dataset"), adminController.uploadDataset);

// Handle undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crop_suggestion_system";

// Connect to Database and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Database Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Backend Server running in production mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  });
