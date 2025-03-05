const mongoose = require("mongoose");

const interviewSubmissionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview", // ✅ Matches your actual model name
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // ✅ Matches your actual model name
      required: true,
    },
    jobPosition: {
      type: String,
      required: true,
    },
    experienceRequired: {
      type: String,
      required: true,
    },
    answers: [
      {
        question: { type: String, required: true }, // ✅ Ensure questions are saved
        userAnswer: { type: String, required: true },
      },
    ],
    overallRating: {
      type: Number,
      default: null, // ✅ Allow null if AI fails to generate rating
    },
    feedback: [
      {
        question: String,
        response: String,
      },
    ],
    emotionDetected: {
      type: String,
      default: "Not detected",
    },
    submissionTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt fields
);

module.exports = mongoose.model("InterviewSubmission", interviewSubmissionSchema);
