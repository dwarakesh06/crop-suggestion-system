const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes (strictly required)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretcropkeyjwt12345");

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found with this token"
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route"
    });
  }
};

// Optional protect routes (guest allowed, login tracked)
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretcropkeyjwt12345");
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    // If token is invalid or expired, just proceed as guest
    next();
  }
};

// Grant access to admin role
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access only"
    });
  }
};

module.exports = { protect, optionalProtect, admin };
