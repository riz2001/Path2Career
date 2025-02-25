const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  jobPosition: { type: String, required: true },
  jobDesc: { type: String, required: true },
  jobExperience: { type: Number, required: true },
  questions: [{ question: String, answer: String }], // AI-generated questions
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Interview", InterviewSchema);
