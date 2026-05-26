const axios = require("axios");
const Prediction = require("../models/Prediction");

// @desc    Perform Crop Suggestion
// @route   POST /api/predict
// @access  Public (Will log if authenticated)
exports.predictCrop = async (req, res, next) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    // Basic Input Validation
    if (
      N === undefined ||
      P === undefined ||
      K === undefined ||
      temperature === undefined ||
      humidity === undefined ||
      ph === undefined ||
      rainfall === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required soil and climate features (N, P, K, temperature, humidity, ph, rainfall)."
      });
    }

    // Call FastAPI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
    let aiResponse;
    try {
      aiResponse = await axios.post(`${aiServiceUrl}/predict`, {
        N: Number(N),
        P: Number(P),
        K: Number(K),
        temperature: Number(temperature),
        humidity: Number(humidity),
        ph: Number(ph),
        rainfall: Number(rainfall)
      });
    } catch (err) {
      console.error("AI service connection error:", err.message);
      return res.status(503).json({
        success: false,
        message: "AI Prediction Service is currently unavailable. Please verify that the AI service is running."
      });
    }

    const { crop, confidence, fertilizer_recommendation, yield_estimation } = aiResponse.data;

    // Build prediction document
    const predictionData = {
      inputs: { N, P, K, temperature, humidity, ph, rainfall },
      predictedCrop: crop,
      confidence: confidence,
      fertilizerRecommendation: {
        status: fertilizer_recommendation.status,
        details: fertilizer_recommendation.details.map(d => ({
          nutrient: d.nutrient,
          status: d.status,
          message: d.message,
          remedy: d.remedy
        }))
      },
      yieldEstimation: {
        minYield: yield_estimation.min_yield,
        maxYield: yield_estimation.max_yield,
        unit: yield_estimation.unit,
        explanation: yield_estimation.explanation
      }
    };

    // If user is authenticated, save prediction to MongoDB
    if (req.user) {
      predictionData.userId = req.user._id;
      const prediction = await Prediction.create(predictionData);
      return res.status(200).json({
        success: true,
        data: prediction
      });
    }

    // Return response without saving if not logged in (guest prediction)
    return res.status(200).json({
      success: true,
      data: predictionData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user prediction history
// @route   GET /api/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Prediction.countDocuments({ userId: req.user.id });
    const predictions = await Prediction.find({ userId: req.user.id })
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
