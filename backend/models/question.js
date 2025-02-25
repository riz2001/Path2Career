const mongoose = require('mongoose');

// Define the individual question schema
const questionItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true },
  explanation: { type: String } // Optional explanation field
});

// Main schema that stores questions for each week with company information
const questionSchema = new mongoose.Schema({
  company: { type: String, required: true }, // New company field
  week: { type: Number, required: true }, // Week number
  question: { type: String, required: true },  // Main question
  options: { type: [String], required: true }, // Array of options
  answer: { type: String, required: true }, // Correct answer
  explanation: { type: String }, // Optional explanation field
  availableFrom: { type: Date, default: Date.now }, // When the question becomes available
  dueDate: { type: Date, required: true } // Due date for the question
});

module.exports = mongoose.model('Question', questionSchema);
