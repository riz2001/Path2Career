const mongoose = require('mongoose');  

// Define the schema for user answers 
const userAnswerSchema = new mongoose.Schema({   
  week: { 
    type: String,  // Week number the quiz was taken (can be Number if you prefer)
    required: true // Optional: Mark as required if necessary
  },
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', // Reference to the Question model (adjust if your model has a different name)
    required: true // Ensure that each answer is linked to a specific question
  },  
  answer: { 
    type: String, 
    required: true // Mark as required to ensure users provide an answer
  }, 
  company: { 
    type: String, 
    required: true // Mark as required to ensure users provide an answer
  },// User's answer   
  explanation: { 
    type: String 
  }, // Optional explanation for the question   
  submittedAt: { 
    type: Date, 
    default: Date.now // Timestamp for when the answer was submitted 
  } 
});  

// Export the UserAnswer model 
module.exports = mongoose.model('UserAnswer', userAnswerSchema);
