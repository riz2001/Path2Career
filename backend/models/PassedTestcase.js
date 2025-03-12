const mongoose = require('mongoose');

const PassedTestCaseSchema = new mongoose.Schema({
    week: {
        type: String,
        required: true,
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question', // Assuming you have a Question model
      
    },
    questionTitle: {
        type: String,
        
    },

    code: {
        type: String,
      
    },
    passedCount: {
        type: Number,
       
    },
    company: {
        type: String,
       
    },
    totalTestCases: {
        type: Number,
       
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create the model using the schema
const PassedTestCase = mongoose.model('PassedTestCase', PassedTestCaseSchema);

module.exports = PassedTestCase;
