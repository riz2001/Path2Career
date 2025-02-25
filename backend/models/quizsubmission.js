// Example schema for MongoDB using Mongoose
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      answer: String,
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  submissionTime: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true, // Make dueDate required
  },
 
});
module.exports = mongoose.model('quizSubmission', submissionSchema);
