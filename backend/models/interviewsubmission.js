const mongoose = require("mongoose");

const interviewSubmissionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    week: {
      type: Number,
      required:true,
    },
    jobPosition: {
      type: String,
      required: true,
    },
    experienceRequired: {
      type: String
    },
    answers: [
      {
        question: { type: String, required: true },
        userAnswer: { type: String, required: true },
      },
    ],
    overallRating: {
      type: Number,
      default: null,
    },
    feedback: [
      {
        question: String,
        response: String,
      },
    ],
    emotionDetected: {
      perQuestionAverages: { type: [Number], default: [] },
      overallAverage: { type: Number, default: 0 },
    },
    combinedAverage: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalTimeTaken: {
      type: Number,
      default: 0,
    },
    submissionTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSubmission", interviewSubmissionSchema);
