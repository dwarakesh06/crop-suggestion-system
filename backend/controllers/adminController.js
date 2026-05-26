const fs = require("fs");
const path = require("path");
const axios = require("axios");
const User = require("../models/User");
const Prediction = require("../models/Prediction");
const DatasetMetadata = require("../models/DatasetMetadata");

// @desc    Get system statistics for analytics and dashboards
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalPredictions = await Prediction.countDocuments({});
    
    // Aggregation: Crop frequency count
    const cropDistribution = await Prediction.aggregate([
      { $group: { _id: "$predictedCrop", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Aggregation: Average N, P, K, pH, rainfall
    const soilAverages = await Prediction.aggregate([
      {
        $group: {
          _id: null,
          avgN: { $avg: "$inputs.N" },
          avgP: { $avg: "$inputs.P" },
          avgK: { $avg: "$inputs.K" },
          avgPh: { $avg: "$inputs.ph" },
          avgTemp: { $avg: "$inputs.temperature" },
          avgHumidity: { $avg: "$inputs.humidity" },
          avgRainfall: { $avg: "$inputs.rainfall" }
        }
      }
    ]);

    // Get recent dataset upload details
    const recentUploads = await DatasetMetadata.find({})
      .populate("uploadedBy", "username")
      .sort({ createdAt: -1 })
      .limit(5);

    // Timeline count: Predictions per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const timeline = await Prediction.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPredictions,
        cropDistribution: cropDistribution.map(item => ({
          crop: item._id,
          count: item.count
        })),
        soilAverages: soilAverages[0] || {
          avgN: 0,
          avgP: 0,
          avgK: 0,
          avgPh: 0,
          avgTemp: 0,
          avgHumidity: 0,
          avgRainfall: 0
        },
        timeline: timeline.map(item => ({
          date: item._id,
          count: item.count
        })),
        recentUploads
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Do not allow an admin to delete their own account
    if (userToDelete._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account"
      });
    }

    // Delete user's prediction history as well (optional, but clean)
    await Prediction.deleteMany({ userId: userToDelete._id });
    await userToDelete.deleteOne();

    res.status(200).json({
      success: true,
      message: "User and their prediction history deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all prediction logs (system-wide)
// @route   GET /api/admin/predictions
// @access  Private/Admin
exports.getAllPredictions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const startIndex = (page - 1) * limit;

    const total = await Prediction.countDocuments({});
    const predictions = await Prediction.find({})
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: predictions.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: predictions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a prediction record
// @route   DELETE /api/admin/predictions/:id
// @access  Private/Admin
exports.deletePrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: "Prediction record not found"
      });
    }

    await prediction.deleteOne();

    res.status(200).json({
      success: true,
      message: "Prediction record deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload new dataset and trigger model retraining
// @route   POST /api/admin/dataset-upload
// @access  Private/Admin
exports.uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV dataset file"
      });
    }

    const filePath = req.file.path;
    const relativePath = path.relative(path.join(__dirname, "../.."), filePath).replace(/\\/g, "/");

    // Read CSV file to estimate row count
    let rowCount = 0;
    try {
      const csvData = fs.readFileSync(filePath, "utf-8");
      // Split by lines and filter out empty lines
      const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== "");
      rowCount = lines.length > 0 ? lines.length - 1 : 0; // subtract header
    } catch (readErr) {
      console.error("Error reading uploaded CSV:", readErr);
    }

    // Save metadata
    const metadata = await DatasetMetadata.create({
      filename: req.file.filename,
      uploadedBy: req.user._id,
      recordCount: rowCount,
      status: "training"
    });

    // Fire-and-forget or await training? Since training might take a few seconds,
    // we call the AI service `/train` API.
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
    
    // We can do it asynchronously (background training) so the client gets a quick response,
    // but since the dataset is small (a few hundred rows), training takes < 2 seconds.
    // Let's await it and provide instant feedback!
    try {
      const trainResponse = await axios.post(`${aiServiceUrl}/train`, {
        csv_path: relativePath
      });

      const { accuracy } = trainResponse.data.metrics;

      // Update metadata on success
      metadata.status = "trained";
      metadata.accuracy = accuracy;
      metadata.trainedAt = new Date();
      await metadata.save();

      res.status(200).json({
        success: true,
        message: "Dataset uploaded and model retrained successfully!",
        data: metadata,
        metrics: trainResponse.data.metrics
      });
    } catch (trainErr) {
      console.error("AI service training error:", trainErr.message);
      
      // Update metadata on failure
      metadata.status = "failed";
      await metadata.save();

      res.status(500).json({
        success: false,
        message: "Dataset uploaded, but model retraining failed on AI Service: " + (trainErr.response?.data?.detail || trainErr.message),
        data: metadata
      });
    }
  } catch (err) {
    next(err);
  }
};
