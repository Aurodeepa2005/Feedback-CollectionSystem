const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// Helper to generate JWT token (expires in 7 days)
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "default_jwt_secret",
    { expiresIn: "7d" }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        error: "UserExists",
        message: "A user with this email address already exists.",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      studentId: role === "student" ? studentId : undefined,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Please provide both email and password.",
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password.",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Your account is deactivated. Please contact support.",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - request reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "NotFound",
        message: "No user found with that email address.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire (1 hour)
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    // For local dev, frontend is usually on port 5173
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a POST request to:\n\n ${resetUrl}`;

    console.log("==========================================");
    console.log("PASSWORD RESET LINK FOR DEV:");
    console.log(resetUrl);
    console.log("==========================================");

    // Setup Nodemailer transporter
    let transporter;
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Setup mock ethereal mail transporter if no config exists
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "ethereal_test_user@ethereal.email",
          pass: "ethereal_test_pass",
        },
      });
    }

    try {
      if (process.env.SMTP_HOST) {
        await transporter.sendMail({
          from: `"FeedbackHub" <${process.env.FROM_EMAIL || "no-reply@uni.edu"}>`,
          to: user.email,
          subject: "Password Reset Link",
          text: message,
        });
      }
      
      res.status(200).json({
        message: "Reset link sent to your email (and logged in the backend console)",
      });
    } catch (mailError) {
      console.error("Nodemailer failed to send email, but logged link in console:", mailError);
      
      // Still return 200 for dev because the link is logged in the console!
      res.status(200).json({
        message: "Reset link generated and logged in backend console (failed to send email)",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Token and new password are required.",
      });
    }

    // Hash the token sent in request to compare with DB hashed token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Invalid or expired password reset token.",
      });
    }

    // Set new password (automatically hashed by model pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password (logged-in user)
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Current password and new password are required.",
      });
    }

    // Fetch user with password field since it is excluded by default
    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Current password is incorrect.",
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated",
    });
  } catch (error) {
    next(error);
  }
};
