const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    teachingRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    contentRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    recommendation: {
      type: String,
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

// Prevent a student from submitting feedback for the same form multiple times
SubmissionSchema.index({ studentId: 1, formId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", SubmissionSchema);
