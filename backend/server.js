require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");

const app = express();

/* Middlewares */
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

/* Test Route */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Feedback Collection System API is running",
  });
});

/* 404 Handler - for routes that don't exist */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* Global Error Handler */
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* Start Server only after DB connects */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
};

startServer();
