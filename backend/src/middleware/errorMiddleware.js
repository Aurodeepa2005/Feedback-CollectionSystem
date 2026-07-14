const errorMiddleware = (err, req, res, next) => {
  console.error("Error handler caught:", err);

  const statusCode = err.statusCode || 500;
  
  let errorName = err.name || "ServerError";
  let errorMessage = err.message || "Something went wrong on the server";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    errorName = "ValidationError";
    errorMessage = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle Duplicate key error (Mongoose)
  if (err.code === 11000) {
    errorName = "DuplicateKeyError";
    const keyName = Object.keys(err.keyValue)[0];
    errorMessage = `A record with this ${keyName} already exists.`;
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === "CastError") {
    errorName = "NotFoundError";
    errorMessage = `Resource not found with ID of ${err.value}`;
  }

  res.status(statusCode).json({
    error: errorName,
    message: errorMessage,
  });
};

module.exports = errorMiddleware;
