const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    overallRating: {
      type: Number,
      required: [true, "Overall rating is required"],
      min: 1,
      max: 5,
    },
    teachingRating: {
      type: Number,
      required: [true, "Teaching quality rating is required"],
      min: 1,
      max: 5,
    },
    contentRating: {
      type: Number,
      required: [true, "Course content rating is required"],
      min: 1,
      max: 5,
    },
    recommendation: {
      type: String,
      required: [true, "Recommendation is required"],
      enum: ["Yes", "No"],
    },
    comment: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Response", ResponseSchema);
