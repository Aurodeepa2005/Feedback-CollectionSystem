const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Not authorized to access this resource, token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");

    // Fetch user and attach to request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found or account deactivated",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Your account is deactivated. Please contact the administrator.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "TokenExpired",
        message: "Your token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid token. Please log in again.",
    });
  }
};

module.exports = authMiddleware;
