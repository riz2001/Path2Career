const mongoose = require('mongoose');

const compilerSubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Reference to User model
    week: { type: Number, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cquestions', required: true },
    passedCount: { type: Number, required: true },
    totalTestCases: { type: Number, required: true },
    code: { type: String, required: true },
    testResults: [{
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
    }],
    submissionDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true }, 
    company:{type:String,required:true }// Add the dueDate field
});

const CompilerSubmission = mongoose.model('CompilerSubmission', compilerSubmissionSchema);
module.exports = CompilerSubmission;
