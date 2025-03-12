const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  jobPosition: { type: String, required: true },
  jobDesc: { type: String, required: true },
  jobExperience: { type: Number },
  dueDate: { type: Date, required: true },       // New field for due date
  week: { type: Number, required: true },          // New field for week
  questions: [{ question: String, answer: String }], // AI-generated questions
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Interview", InterviewSchema);
