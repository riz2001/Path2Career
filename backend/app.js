const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require("./models/Mockinterview");
const registrationModel = require("./models/Registration");
const userModel = require("./models/users.js");
const Question = require("./models/question");
const Submission = require("./models/quizsubmission");
const Cquestions= require("./models/Cquestion");
const userAnswer = require('./models/Answers');
const CompilerSubmission = require('./models/CompilerSubmission');
const PassedTestCase = require('./models/PassedTestcase');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jobModel = require("./models/job");
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const Admin = require('./models/admin'); 
const { spawn } = require('child_process');
const InterviewSubmission = require("./models/interviewsubmission"); // ✅ Correct path

// Initialize Express App
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins

// MongoDB Connection
const mongoURI = "mongodb+srv://rizwan2001:rizwan2001@cluster0.6ucejfl.mongodb.net/path2careernew?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));



// Set your Gemini API key directly in the code
const GEMINI_API_KEY = "AIzaSyB1cE9da4QfoAUyRZat367HLOGTqYtZWa0"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const recordingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timeSlotId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Recording = mongoose.model('Recording', recordingSchema);


app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve the uploads folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads'); // Directory to store uploaded images
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // File naming convention
    },
  });
  
  const upload = multer({ storage });
  const uploads = multer({ storage });

app.post('/api/upload', uploads.single('videoFile'), async (req, res) => {
  try {
    const videoFile = req.file;
    const { userId, timeSlotId } = req.body; // Expect these fields in FormData
    if (!videoFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create a new recording document
    const newRecording = new Recording({
      userId,
      timeSlotId,
      fileUrl: videoFile.path, // Path where file is stored locally
      timestamp: new Date(),
    });

    await newRecording.save();
    res.status(201).json({ fileUrl: videoFile.path });
  } catch (error) {
    console.error("Error uploading recording:", error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await Recording.find(); // Retrieve all recordings
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/create-admin', async (req, res) => {
  const {  email, password, type } = req.body;

  // Basic validation
  if ( !email || !password || !type) {
    return res.status(400).json({ message: 'Name, email, password and type are required.' });
  }
  
  // Ensure type is valid (this check is optional since the schema enforces it)
  const allowedTypes = ['btech', 'mca', 'mba', 'admin'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: `Type must be one of: ${allowedTypes.join(', ')}` });
  }

  try {
    // In production, be sure to hash the password!
    const admin = new Admin({  email, password, type });
    await admin.save();
    res.json({ message: 'Admin created successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // In production, compare hashed passwords using bcrypt
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Return a response that includes a type field
    res.json({
      message: 'Login successful',
      type: admin.type,  // "mca", "mba", "btech", or "admin"
      admin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

app.get("/api/combined-score/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Quiz Submissions: Assume each quiz submission has a numeric 'score'
    const quizSubs = await Submission.find({ userId });

    const totalQuestionsAttempted = quizSubs.reduce((sum, sub) => sum + sub.totalQuestions, 0);
    const totalScore = quizSubs.reduce((sum, sub) => sum + sub.score, 0);
    
    const quizScore = totalQuestionsAttempted > 0 ? totalScore / totalQuestionsAttempted *100: 0;
    
    // 2. Interview Submissions: Each interview submission has an 'overallRating'
    const interviewSubs = await InterviewSubmission.find({ userId });
    const interviewScore =
      interviewSubs.length > 0
        ? interviewSubs.reduce((sum, sub) => sum + (sub.overallRating *10 || 0), 0) / interviewSubs.length
        : 0;

    // 3. Compiler Submissions: Calculate a score per submission as a percentage
    const compilerSubs = await CompilerSubmission.find({ userId });
    let compilerScore = 0;
    let totalPassedCases = 0;
    let totalTestCases = 0;

    if (compilerSubs.length > 0) {
      const scores = compilerSubs.map(sub => {
        // Avoid division by zero
        const passedCases = sub.passedCount || 0;
        const testCases = sub.totalTestCases || 0;
        totalPassedCases += passedCases;
        totalTestCases += testCases;
       

      

        return testCases > 0 ? (passedCases / testCases) * 100 : 0;
       
      });
     
      compilerScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    }

    // Calculate combined average (simple average of the three scores)
    const combinedAverage = (quizScore + interviewScore + compilerScore) / 3;

    res.status(200).json({
      quizScore,
      interviewScore,
      compilerScore,
      totalPassedCases,
      totalTestCases,
      combinedAverage
    });
  } catch (error) {
    console.error("Error fetching combined score:", error);
    res.status(500).json({ error: "Failed to fetch combined score" });
    const quizSubs = await Submission.find({ userId });
const interviewSubs = await InterviewSubmission.find({ userId });
const compilerSubs = await CompilerSubmission.find({ userId });

console.log("Interview:", interviewSubs);
console.log("Compiler:", compilerSubs);

  }
});


app.get("/api/all-combined-scores", async (req, res) => {
  try {
    const users = await userModel.find(); // Fetch all users

    // Calculate combined scores for each user
    const combinedScores = await Promise.all(users.map(async (user) => {
      const userId = user._id;

      // Calculate quiz score
      const quizSubs = await Submission.find({ userId });
      const totalQuestionsAttempted = quizSubs.reduce((sum, sub) => sum + sub.totalQuestions, 0);
      const totalScore = quizSubs.reduce((sum, sub) => sum + sub.score, 0);
      const quizScore = totalQuestionsAttempted > 0 ? (totalScore / totalQuestionsAttempted) * 100 : 0;

      // Calculate interview score
      const interviewSubs = await InterviewSubmission.find({ userId });
      const interviewScore = interviewSubs.length > 0
        ? interviewSubs.reduce((sum, sub) => sum + (sub.overallRating * 10 || 0), 0) / interviewSubs.length
        : 0;

      // Calculate compiler score
      const compilerSubs = await CompilerSubmission.find({ userId });
      let compilerScore = 0;
      let totalPassedCases = 0;
      let totalTestCases = 0;

      if (compilerSubs.length > 0) {
        const scores = compilerSubs.map(sub => {
          const passedCases = sub.passedCount || 0;
          const testCases = sub.totalTestCases || 0;
          totalPassedCases += passedCases;
          totalTestCases += testCases;
          return testCases > 0 ? (passedCases / testCases) * 100 : 0;
        });

        compilerScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
      }

      // Calculate combined average
      const combinedAverage = (quizScore + interviewScore + compilerScore) / 3;

      return { userId, name: user.name, admissionNo: user.admissionNo, combinedAverage };
    }));

    // Sort users by combinedAverage to find the topper
    combinedScores.sort((a, b) => b.combinedAverage - a.combinedAverage);

    res.status(200).json(combinedScores);
  } catch (error) {
    console.error("Error fetching combined scores:", error);
    res.status(500).json({ error: "Failed to fetch combined scores" });
  }
});


app.get("/api/weekly-scores/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch Compiler Submissions
    const compilerSubmissions = await CompilerSubmission.find({ userId });
    
    // Fetch Quiz Submissions
    const quizSubmissions = await Submission.find({ userId });

    const weeklyScores = {};

    // Process Compiler Scores
    compilerSubmissions.forEach(sub => {
      const week = sub.week;
      const score = sub.passedCount || 0;

      if (!weeklyScores[week]) {
        weeklyScores[week] = { compilerScores: [], quizScores: [] };
      }

      weeklyScores[week].compilerScores.push(score);
    });

    // Process Quiz Scores
    quizSubmissions.forEach(sub => {
      const week = sub.week;
      const score = sub.score || 0;

      if (!weeklyScores[week]) {
        weeklyScores[week] = { compilerScores: [], quizScores: [] };
      }

      weeklyScores[week].quizScores.push(score);
    });

    // Calculate Average for Both
    const finalScores = {};

    for (const week in weeklyScores) {
      const compilerAvg = weeklyScores[week].compilerScores.length
        ? (weeklyScores[week].compilerScores.reduce((a, b) => a + b, 0) / weeklyScores[week].compilerScores.length)
        : 0;

      const quizAvg = weeklyScores[week].quizScores.length
        ? (weeklyScores[week].quizScores.reduce((a, b) => a + b, 0) / weeklyScores[week].quizScores.length)
        : 0;

      finalScores[week] = {
        compilerAverage: compilerAvg.toFixed(2),
        quizAverage: quizAvg.toFixed(2),
        overallAverage: ((compilerAvg + quizAvg) / 2).toFixed(2),
      };
    }

    res.status(200).json(finalScores);
  } catch (error) {
    console.error("Error fetching weekly scores:", error);
    res.status(500).json({ error: "Failed to fetch weekly scores" });
  }
});

// **📌 Route to Generate AI Content**
app.post("/api/create-interview", async (req, res) => {
  try {
    // Destructure the new fields from request body
    const { jobPosition, jobDesc, jobExperience, dueDate, week } = req.body;
    const interview = new Interview({
      jobPosition,
      jobDesc,
      jobExperience,
      dueDate,  // Save due date
      week,     // Save week
      questions: [] // Initially no questions
    });
    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **📌 Get All Interviews**
// Returns a sorted array of distinct week numbers (e.g., [1, 2, 3, ...])
// This endpoint returns distinct weeks along with a representative interview id for that week.
app.get("/api/interviews/weeks", async (req, res) => {
  try {
    const weeks = await Interview.aggregate([
      {
        $group: {
          _id: "$week",
          interviewId: { $first: "$_id" },
          jobPosition: { $first: "$jobPosition" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    // Map the result into an array of objects with keys 'week' and 'interviewId'
    const result = weeks.map(w => ({
      week: w._id,
      interviewId: w.interviewId,
      jobPosition: w.jobPosition
    }));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching weeks:", error);
    res.status(500).json({ error: "Failed to fetch weeks" });
  }
});



app.get('/api/interviewweek-ranges', async (req, res) => {
  try {
    // Find the max week value
    const maxWeek = await InterviewSubmission.find()
      .sort({ week: -1 })
      .limit(1)
      .select('week');

    const ranges = [];
    if (maxWeek.length > 0) {
      const currentMaxWeek = maxWeek[0].week;
      for (let i = 1; i <= currentMaxWeek; i += 4) {
        if (i + 3 <= currentMaxWeek) {
          ranges.push(`Week ${i} to Week ${i + 3}`);
        }
      }
    }
    res.json(ranges);
  } catch (error) {
    console.error('Error fetching week ranges:', error);
    res.status(500).send('Server Error');
  }
});

app.get('/api/interviewscores/:startWeek/:endWeek', async (req, res) => {
  const { startWeek, endWeek } = req.params;

  try {
    // Fetch submissions for the selected week range, excluding entries with null userId.
    // Only include submissions where the populated user has course 'MCA'.
    const submissions = await InterviewSubmission.find({
      week: { $gte: parseInt(startWeek), $lte: parseInt(endWeek) },
      userId: { $ne: null }
    }).populate({
      path: 'userId',
      select: 'name admissionno rollno courseYear email course',
      match: { batch: 'MCA' }
    });

    // Filter out submissions where the user didn't match (i.e. population resulted in null)
    const validSubmissions = submissions.filter(submission => submission.userId);

    // Aggregate scores per user
    const userScores = {};
    validSubmissions.forEach((submission) => {
      if (submission.userId && submission.userId._id) {
        if (!userScores[submission.userId._id]) {
          userScores[submission.userId._id] = {
            user: submission.userId,
            score: 0,
          };
        }
        userScores[submission.userId._id].score += submission.combinedAverage; // Adjust score field as needed
      }
    });

    res.json(Object.values(userScores));
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).send('Server Error');
  }
});



app.get('/api/mbainterviewscores/:startWeek/:endWeek', async (req, res) => {
  const { startWeek, endWeek } = req.params;

  try {
    // Fetch submissions for the selected week range, excluding entries with null userId.
    // Only include submissions where the populated user has course 'MCA'.
    const submissions = await InterviewSubmission.find({
      week: { $gte: parseInt(startWeek), $lte: parseInt(endWeek) },
      userId: { $ne: null }
    }).populate({
      path: 'userId',
      select: 'name admissionno rollno courseYear email course batch',
      match: { batch: 'MBA' }
    });

    // Filter out submissions where the user didn't match (i.e. population resulted in null)
    const validSubmissions = submissions.filter(submission => submission.userId);

    // Aggregate scores per user
    const userScores = {};
    validSubmissions.forEach((submission) => {
      if (submission.userId && submission.userId._id) {
        if (!userScores[submission.userId._id]) {
          userScores[submission.userId._id] = {
            user: submission.userId,
            score: 0,
          };
        }
        userScores[submission.userId._id].score += submission.combinedAverage; // Adjust score field as needed
      }
    });

    res.json(Object.values(userScores));
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).send('Server Error');
  }
});

// Fetch user profile using userId from URL
app.get('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'User not found' });
    }

    res.json({ status: 'success', user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
// **📌 Generate AI-based Questions for an Interview**
app.post("/api/generate-questions/:interviewId", async (req, res) => {
  const { interviewId } = req.params;
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    const prompt = `Generate 5 interview questions for a ${interview.jobPosition} role. 
    Job Description: ${interview.jobDesc}.
    Required Experience: ${interview.jobExperience} years.
    Format the output in JSON with 'question' fields`;

    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const rawResponse = await result.response.text();
    console.log("AI Response:", rawResponse);

    const jsonStart = rawResponse.indexOf("[");
    const jsonEnd = rawResponse.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const questions = JSON.parse(rawResponse.substring(jsonStart, jsonEnd + 1));

      interview.questions = questions;
      await interview.save();

      return res.status(201).json(interview);
    } else {
      return res.status(500).json({ error: "AI Response Error" });
    }
  } catch (error) {
    console.error("❌ AI Error:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});
app.get("/api/interviews/:interviewId", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interview details" });
  }
});
app.post("/api/generate-overall-feedback", async (req, res) => {
  const { answers } = req.body;

  if (!answers || answers.length === 0) {
    return res.status(400).json({ error: "Answers are required" });
  }

  const prompt = `Here are interview questions and user answers:\n\n${answers.map(
    (a, i) => `Question ${i + 1}: ${a.question}\nAnswer: ${a.userAnswer}\n`
  ).join("\n")}

  Please provide constructive feedback for each answer. Also, give an **overall rating (1-10)** based on all responses. Return JSON with:
  - feedback: an object with question numbers as keys and feedback as values.
  - overallRating: a number (1-10).
  `;

  try {
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawResponse = await result.response.text();

    const feedbackData = JSON.parse(rawResponse.substring(rawResponse.indexOf("{"), rawResponse.lastIndexOf("}") + 1));

    res.json(feedbackData);
  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});


app.get("/api/interviewweeks", async (req, res) => {
  try {
    const weeks = await InterviewSubmission.distinct("week"); // Fetch distinct weeks
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching weeks" });
  }
});


app.get("/api/mca-jobsubmissions-and-non-submissions/:week", async (req, res) => {
  const week = parseInt(req.params.week); // Convert week to integer
  const { company } = req.query; // Filtering by company

  try {
    // Filter only MCA students
    const userFilter = { batch: /MCA/i };

    const users = await userModel
      .find(userFilter)
      .select("name email batch rollno admissionno courseYear")
      .exec();

    // Filter submissions based on week and company (if provided)
    const submissionFilter = { week };
    if (company) {
      submissionFilter.company = company;
    }

    const submissions = await InterviewSubmission.find(submissionFilter)
      .populate({
        path: "userId",
        model: "users",
        select: "name email batch rollno courseYear admissionno",
        match: userFilter, // Ensures only MCA students are considered
      })
      .select("submissionTime overallRating week jobPosition company")
      .exec();

    // Filter out null user IDs (if the user is not from MCA batch)
    const validSubmissions = submissions.filter(sub => sub.userId);

    // Get IDs of users who submitted
    const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

    // Filter out users who haven't submitted
    const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

    res.json({
      submissions: validSubmissions,
      nonSubmittedUsers,
    });
  } catch (error) {
    console.error("Error fetching MCA job submissions and non-submissions:", error);
    res.status(500).json({
      message: "Error fetching MCA job submissions and non-submissions",
      error: error.message,
    });
  }
});


app.get("/api/mba-jobsubmissions-and-non-submissions/:week", async (req, res) => {
  const week = parseInt(req.params.week); // Convert week to integer
  const { company } = req.query; // Filtering by company

  try {
    // Filter only MCA students
    const userFilter = { batch: /MBA/i };

    const users = await userModel
      .find(userFilter)
      .select("name email batch rollno admissionno courseYear")
      .exec();

    // Filter submissions based on week and company (if provided)
    const submissionFilter = { week };
    if (company) {
      submissionFilter.company = company;
    }

    const submissions = await InterviewSubmission.find(submissionFilter)
      .populate({
        path: "userId",
        model: "users",
        select: "name email batch rollno courseYear admissionno",
        match: userFilter, // Ensures only MCA students are considered
      })
      .select("submissionTime overallRating week jobPosition company")
      .exec();

    // Filter out null user IDs (if the user is not from MCA batch)
    const validSubmissions = submissions.filter(sub => sub.userId);

    // Get IDs of users who submitted
    const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

    // Filter out users who haven't submitted
    const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

    res.json({
      submissions: validSubmissions,
      nonSubmittedUsers,
    });
  } catch (error) {
    console.error("Error fetching MCA job submissions and non-submissions:", error);
    res.status(500).json({
      message: "Error fetching MCA job submissions and non-submissions",
      error: error.message,
    });
  }
});

app.get("/api/jobsubmissions-and-non-submissions/:week", async (req, res) => {
  const week = parseInt(req.params.week); // Convert week to integer
  const { company } = req.query; // Filtering by company

  try {
    // Exclude MBA and MCA students
    const userFilter = { batch: { $not: /^(MBA|MCA)$/i } };

    const users = await userModel
      .find(userFilter)
      .select("name email batch rollno admissionno courseYear")
      .exec();

    // Filter submissions based on week and company (if provided)
    const submissionFilter = { week };
    if (company) {
      submissionFilter.company = company;
    }

    const submissions = await InterviewSubmission.find(submissionFilter)
      .populate({
        path: "userId",
        model: "users",
        select: "name email batch rollno courseYear admissionno",
        match: userFilter, // Ensures only non-MBA and non-MCA students are considered
      })
      .select("submissionTime overallRating week jobPosition company")
      .exec();

    // Filter out null user IDs (if the user is not from the allowed batches)
    const validSubmissions = submissions.filter(sub => sub.userId);

    // Get IDs of users who submitted
    const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

    // Filter out users who haven't submitted
    const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

    res.json({
      submissions: validSubmissions,
      nonSubmittedUsers,
    });
  } catch (error) {
    console.error("Error fetching job submissions and non-submissions:", error);
    res.status(500).json({
      message: "Error fetching job submissions and non-submissions",
      error: error.message,
    });
  }
});

app.get('/api/interview-submissions', async (req, res) => {
  try {
    const userId = req.headers['user-id']; // Get userId from headers
    if (!userId) return res.status(400).json({ status: "error", message: "User ID is required" });

    const submissions = await InterviewSubmission.find({ userId }).populate('interviewId', 'title');

    res.json({ status: "success", submissions });
  } catch (error) {
    console.error("Error fetching interview submissions:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});
app.get("/api/check-submission/:interviewId/:userId", async (req, res) => {
  try {
    const { interviewId, userId } = req.params;

    const existingSubmission = await InterviewSubmission.findOne({ interviewId, userId });

    if (existingSubmission) {
      return res.json({ alreadySubmitted: true });
    }

    res.json({ alreadySubmitted: false });
  } catch (error) {
    console.error("Error checking submission:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/submit-interview", async (req, res) => {
  try {
    const {
      interviewId,
      userId,
      jobPosition,
      experienceRequired,
      answers,
      overallRating,
      feedback,
      week,
      emotionDetected,
      combinedAverage,
      totalTimeTaken,
    } = req.body;

    // Fetch the Interview to get its dueDate (and validate interview exists)
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
    // Use the dueDate from the interview document
    const dueDate = interview.dueDate;

    const newSubmission = new InterviewSubmission({
      interviewId,
      userId,
      jobPosition,
      experienceRequired,
      answers,
      dueDate,
      week, // use the interview's dueDate
      overallRating,
      feedback,
      emotionDetected,
      combinedAverage,
      totalTimeTaken,
    });

    await newSubmission.save();
    res.status(201).json({ message: "Interview submitted successfully!" });
  } catch (error) {
    console.error("Error submitting interview:", error);
    res.status(500).json({ error: "Failed to submit interview" });
  }
});



app.get("/api/mba-jobsubmissions-and-non-submissions/:jobPosition", async (req, res) => {
  const jobPosition = req.params.jobPosition;
  const { company } = req.query; // Filtering by company

  try {
    // Filter users by batch containing "MBA"
    const userFilter = { batch: /MBA/i }; // Case-insensitive match for MCA students

    const users = await userModel
      .find(userFilter)
      .select("name email batch rollno admissionno courseYear")
      .exec();

    // Fetch submissions for the given jobPosition and company, filtering by MCA students
    const submissionFilter = { jobPosition };
    if (company) {
      submissionFilter.company = company;
    }

    const submissions = await InterviewSubmission.find(submissionFilter)
      .populate({
        path: "userId",
        model: "users",
        select: "name email batch rollno courseYear admissionno",
        match: userFilter, // Ensures only MCA students are considered
      })
      .select("submissionTime overallRating jobPosition company")
      .exec();

    // Remove null userIds (users who do not match MCA batch)
    const validSubmissions = submissions.filter(sub => sub.userId);

    // Get user IDs who submitted
    const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

    // Identify MCA students who have not submitted
    const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

    res.json({
      submissions: validSubmissions,
      nonSubmittedUsers,
    });
  } catch (error) {
    console.error("Error fetching MBA job submissions and non-submissions:", error);
    res.status(500).json({
      message: "Error fetching MBA job submissions and non-submissions",
      error: error.message,
    });
  }
});

app.get("/api/btech-submissions-and-non-submissions/:jobPosition", async (req, res) => {
  const jobPosition = req.params.jobPosition;
  const { company, batch } = req.query; // Accept batch filter dynamically

  try {
    // Apply batch filtering only if provided
    const userFilter = batch ? { batch: new RegExp(batch, "i") } : {}; // Case-insensitive filtering

    // Fetch users based on the provided batch filter
    const users = await userModel
      .find(userFilter)
      .select("name email batch rollno admissionno courseYear")
      .exec();

    // Fetch submissions for the given jobPosition and company
    const submissionFilter = { jobPosition };
    if (company) {
      submissionFilter.company = company;
    }

    const submissions = await InterviewSubmission.find(submissionFilter)
      .populate({
        path: "userId",
        model: "users",
        select: "name email batch rollno courseYear admissionno",
        match: userFilter, // Ensures only users from the filtered batch are considered
      })
      .select("submissionTime overallRating jobPosition company")
      .exec();

    // Remove null userIds (users who do not match the batch)
    const validSubmissions = submissions.filter(sub => sub.userId);

    // Get user IDs who submitted
    const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

    // Identify students who have not submitted
    const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

    res.json({
      submissions: validSubmissions,
      nonSubmittedUsers,
    });
  } catch (error) {
    console.error("Error fetching job submissions and non-submissions:", error);
    res.status(500).json({
      message: "Error fetching job submissions and non-submissions",
      error: error.message,
    });
  }
});




//timeslot
app.post('/api/addtimeslot', async (req, res) => {
  const { userIds, timeSlot, date, meetingLink } = req.body;
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No userIds provided' });
  }

  try {
    const newDate = new Date(date);
    const month = newDate.getMonth();
    const year = newDate.getFullYear();

    // Group selected users by courseYear
    const usersByCourse = {};
    const users = await userModel.find({ _id: { $in: userIds } });

    users.forEach(user => {
      if (!usersByCourse[user.courseYear]) {
        usersByCourse[user.courseYear] = [];
      }
      usersByCourse[user.courseYear].push(user._id);
    });

    // Define the date range for the given month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Process each courseYear group
    for (let courseYear in usersByCourse) {
      const usersInCourse = await userModel.find({ 
        courseYear,
        "timeSlots.date": { $gte: startDate, $lte: endDate }
      }, { timeSlots: 1 });

      // Gather existing groups for this month and courseYear
      const existingGroups = {};
      let maxGroupNumber = 0;

      usersInCourse.forEach(user => {
        user.timeSlots.forEach(slot => {
          const slotDate = new Date(slot.date);
          if (slotDate >= startDate && slotDate <= endDate) {
            if (slot.timeSlot) {
              existingGroups[slot.timeSlot] = slot.group;
              const parts = slot.group.split('Group');
              if (parts.length === 2) {
                const num = parseInt(parts[1], 10);
                if (!isNaN(num) && num > maxGroupNumber) {
                  maxGroupNumber = num;
                }
              }
            }
          }
        });
      });

      let group;
      if (existingGroups[timeSlot]) {
        group = existingGroups[timeSlot];
      } else {
        group = `${courseYear}-Group${maxGroupNumber + 1}`;
      }

      // List of users who will receive emails
      const usersToNotify = [];

      for (let userId of usersByCourse[courseYear]) {
        const user = await userModel.findById(userId);
        const isSlotBooked = user.timeSlots.some(slot => {
          const slotDate = new Date(slot.date);
          return slot.timeSlot === timeSlot &&
                 slotDate.getMonth() === month &&
                 slotDate.getFullYear() === year;
        });

        if (!isSlotBooked) {
          await userModel.findByIdAndUpdate(userId, {
            $push: { timeSlots: { timeSlot, date, meetingLink, group } },
          });

          usersToNotify.push(user); // Collect users to send emails
        }
      }

      // Send emails to newly assigned users
      for (let user of usersToNotify) {
        const mailOptions = {
          from: "your-email@gmail.com",
          to: user.email,
          subject: "New Time Slot Assigned 📅",
          text: `Hello ${user.name},\n\nYou have been assigned a new time slot:\n\n📅 Date: ${date}\n⏰ Time Slot: ${timeSlot}\n🔗 Meeting Link: ${meetingLink || "N/A"}\n📌 Group: ${group}\n\nPlease be on time.\n\nBest Regards,`,
        };

        // Send email asynchronously
        transporter.sendMail(mailOptions).catch(err => {
          console.error(`Failed to send email to ${user.email}:`, err.message);
        });
      }
    }

    res.json({ status: 'success', message: 'Time slot added and emails sent successfully.' });
  } catch (error) {
    console.error("Error adding time slot:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});;

// Fetch distinct months (you may want to adjust this based on your data structure)

app.get('/api/userss', async (req, res) => {
  try {
    const users = await userModel.find(
      { batch: 'MCA' }, // Filter MCA students
      { 
        name: 1, 
        admissionno: 1, 
        email: 1, 
        courseYear: 1,  
        rollno: 1,      
        _id: 1, 
        timeSlots: 1 
      }
    );
    res.json(users);
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});


app.get('/api/mbauserss', async (req, res) => {
  try {
    const users = await userModel.find(
      { batch: 'MBA' }, // Filter MCA students
      { 
        name: 1, 
        admissionno: 1, 
        email: 1, 
        courseYear: 1,  
        rollno: 1,      
        _id: 1, 
        timeSlots: 1 
      }
    );
    res.json(users);
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

  app.get('/api/btechuserss', async (req, res) => {
    try {
      const users = await userModel.find(
        { batch: { $nin: ['MCA', 'MBA'] } }, // Exclude MCA and MBA students
        { 
          name: 1, 
          admissionno: 1, 
          email: 1, 
          courseYear: 1,  
          rollno: 1,      
          _id: 1, 
          timeSlots: 1 
        }
      );
      res.json(users);
    } catch (error) {
      res.json({ status: 'error', message: error.message });
    }
  });
  

app.get('/api/months', async (req, res) => {
  try {
    // Filter only users whose batch is 'MCA'
    const users = await userModel.find({ batch: 'MCA' }, { timeSlots: 1 });
    const months = new Set();

    users.forEach(user => {
      user.timeSlots.forEach(slot => {
        const date = new Date(slot.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
        months.add(monthYear);
      });
    });

    res.json(Array.from(months)); // Return unique months as an array
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


app.get('/api/mbamonths', async (req, res) => {
  try {
    // Filter only users whose batch is 'MCA'
    const users = await userModel.find({ batch: 'MBA' }, { timeSlots: 1 });
    const months = new Set();

    users.forEach(user => {
      user.timeSlots.forEach(slot => {
        const date = new Date(slot.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
        months.add(monthYear);
      });
    });

    res.json(Array.from(months)); // Return unique months as an array
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
app.get('/api/btechmonths', async (req, res) => {
  try {
    // Filter only users whose batch is NOT MCA or MBA (i.e. BTech students)
    const users = await userModel.find({ batch: { $nin: ['MCA', 'MBA'] } }, { timeSlots: 1 });
    const months = new Set();

    users.forEach(user => {
      user.timeSlots.forEach(slot => {
        const date = new Date(slot.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
        months.add(monthYear);
      });
    });

    res.json(Array.from(months)); // Return unique months as an array
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/timeslots/:month', async (req, res) => {
  const { month } = req.params; // e.g., "2024-9"
  const [year, monthNumber] = month.split('-').map(Number);

  try {
    const users = await userModel.find({}, { 
      name: 1, 
      email: 1, 
      admissionno: 1,
      rollno: 1, // Ensure this field exists in your userModel
      courseYear: 1, // Ensure this field exists in your userModel
      timeSlots: 1 
    });

    const timeSlots = [];

    users.forEach(user => {
      user.timeSlots.forEach(slot => {
        const slotDate = new Date(slot.date);
        if (slotDate.getFullYear() === year && slotDate.getMonth() + 1 === monthNumber) {
          timeSlots.push({ 
            rollno: user.rollno, // Add rollno
            courseYear: user.courseYear ,
            _id: slot._id, 
            timeSlot: slot.timeSlot, 
            date: slot.date, 
            status: slot.status, // Include status
            confirmationStatus: slot.confirmationStatus, // Include confirmation status
            meetingLink: slot.meetingLink, // Include meeting link
            userId: user._id, 
            name: user.name, 
            email: user.email, 
            admissionno: user.admissionno,
            rollno: user.rollno, // Include roll number
           courseYear: user.courseYear // Include semester
          });
        }
      });
    });

    res.json(timeSlots); // Send the time slots with additional fields included
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Mark a time slot as attended
app.post('/api/updatestatus', async (req, res) => {
  const { userId, slotId, status } = req.body;

  // Validate status value
  if (status !== 'attended' && status !== 'not attended') {
    return res.status(400).json({ status: 'error', message: 'Invalid status value. Must be "attended" or "not attended".' });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const slot = user.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ status: 'error', message: 'Slot not found' });
    }

    // Update the slot's status
    slot.status = status;
    await user.save();


    res.json({ status: 'success', message: `Time slot marked as ${status}` });
  } catch (error) {
    console.error('Error updating status:', error); // Log error for debugging
    res.status(500).json({ status: 'error', message: 'An error occurred while updating the status.' });
  }
});

app.get('/api/users/:userId/timeslots', async (req, res) => {
  const { userId } = req.params; // Extract userId from the URL

  try {
    const user = await userModel.findById(userId, { timeSlots: 1 }); // Fetch only the timeSlots field
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.json(user.timeSlots); // Send the time slots as the response
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Fetch distinct months (you may want to adjust this based on your data structure)

app.delete('/api/users/:userId/timeslots/:slotId', async (req, res) => {
  const { userId, slotId } = req.params;

  try {
    // Update the user by removing the specific slot from the time slots array
    await userModel.findByIdAndUpdate(userId, {
      $pull: { timeSlots: { _id: slotId } } // Remove the time slot by its ID
    });

    res.status(200).json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({ message: 'Error deleting time slot', error });
  }
});

app.put('/api/users/:userId/timeslots/update/:slotId', async (req, res) => {
const { userId, slotId } = req.params;
const { confirmationStatus } = req.body; // Get confirmation status from request body

try {
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const slot = user.timeSlots.id(slotId);
  if (!slot) {
    return res.status(404).json({ message: 'Time slot not found' });
  }

  slot.confirmationStatus = confirmationStatus; // Update confirmation status
  await user.save(); // Save the updated user document
  return res.status(200).json({ message: 'Time slot updated successfully', timeSlots: user.timeSlots });
} catch (error) {
  console.error('Error updating time slot:', error);
  res.status(500).json({ message: 'Error updating time slot' });
}
});



const Jobsubmission = require("./models/Jobsubmissions.js");
// Route to handle form submissions
  app.post('/api/offcampussubmit-form', upload.single('image'), async (req, res) => {
    const { companyName, salary, applicationLink, location } = req.body;
    const imagePath = req.file ? req.file.path : null; // Get the uploaded image path
  
    // Check if required fields are present
    if (!companyName || !salary || !imagePath || !applicationLink || !location) {
      return res.status(400).json({ message: 'Company name, salary, image, application link, and location are required.' });
    }
  
    try {
      const newSubmission = new Jobsubmission({
        companyName,
        salary,
        image: imagePath, // Save image path
        applicationLink, // Save application link
        location, // Save location
      });
      
      await newSubmission.save();
      res.status(201).json({ message: 'Form submitted successfully!', submission: newSubmission });
    } catch (error) {
      console.error('Error saving submission:', error);
      res.status(500).json({ message: 'Error saving submission', error: error.message });
    }
  });
  
//offcampus

  // Route to get all submissions
  app.get('/api/offcampussubmissions', async (req, res) => {
    try {
      const submissions = await Jobsubmission.find();
      console.log(submissions); // Log submissions to ensure they are fetched
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
  });
app.post("/signup", async (req, res) => {
  try {
      // Destructure fields from request body, including batch
      const { email, password, phoneno, rollno, name, admissionno, courseYear, batch } = req.body; 
      
      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Check if the email already exists (case-insensitive)
      const existingUser = await userModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      if (existingUser) {
          return res.json({ status: "email id already exists" });
      }

      // Create a new user with batch included
      const newUser = new userModel({
          name,
          admissionno,
          phoneno,
          rollno, 
          courseYear, 
          batch, // Save batch in the database
          email: email.toLowerCase(),
          password: hashedPassword,
          approved: false,
      });

      // Save the new user to the database
      await newUser.save();
      res.json({ status: "success", message: "User registered. Awaiting approval." });
  } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ status: "error", message: "Server error. Please try again." });
  }
});

app.get("/mcaunapproved-users", async (req, res) => {
  try {
    const unapprovedUsers = await userModel.find({ approved: false, batch: "MCA" }); // Only MCA unapproved users
    const approvedUsers = await userModel.find({ approved: true, batch: "MCA" }); // Only MCA approved users

    res.json({ unapprovedUsers, approvedUsers }); // Send both approved and unapproved MCA users
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});
app.post('/api/mcaupdateCourseYear', async (req, res) => {
  try {
    // Update only MCA students from First Year to Second Year
    await userModel.updateMany(
      { courseYear: "First Year A Batch", batch: "MCA" },
      { $set: { courseYear: "Second Year A Batch" } }
    );

    await userModel.updateMany(
      { courseYear: "First Year B Batch", batch: "MCA" },
      { $set: { courseYear: "Second Year B Batch" } }
    );

    return res.status(200).json({ message: 'MCA course years updated successfully!' });
  } catch (error) {
    console.error('Error updating MCA course years:', error);
    return res.status(500).json({ message: 'An error occurred while updating MCA course years.' });
  }
});

app.delete('/api/mcadeleteStudents', async (req, res) => {
  try {
    // Delete only MCA students in Second Year
    await userModel.deleteMany({ courseYear: "Second Year A Batch", batch: "MCA" });
    await userModel.deleteMany({ courseYear: "Second Year B Batch", batch: "MCA" });

    return res.status(200).json({ message: 'MCA students in Second Year A and B have been deleted successfully!' });
  } catch (error) {
    console.error('Error deleting MCA students:', error);
    return res.status(500).json({ message: 'An error occurred while deleting MCA students.' });
  }
});

app.get('/api/interviewss', async (req, res) => {
  try {
      const interviews = await Interview.find();
      res.json({ status: 'success', interviews });
  } catch (error) {
      console.error('Error fetching interviews:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Delete a single interview by ID
app.delete('/api/interviews/:id', async (req, res) => {
  try {
      await Interview.findByIdAndDelete(req.params.id);
      res.json({ status: 'success', message: 'Interview deleted' });
  } catch (error) {
      console.error('Error deleting interview:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Delete all interviews for a specific job position
app.delete('/submissions/week/:week', async (req, res) => {
  try {
      const week = req.params.week;

      // Delete all submissions for the specified week
      const result = await InterviewSubmission.deleteMany({ week });

      

      res.json({ status: 'success', message: `All submissions for week ${week} deleted` });
  } catch (error) {
      console.error('Error deleting submissions:', error);
      res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


app.post('/api/mbaupdateCourseYear', async (req, res) => {
  try {
    // Update only MCA students from First Year to Second Year
    await userModel.updateMany(
      { courseYear: "First Year A Batch", batch: "MBA" },
      { $set: { courseYear: "Second Year A Batch" } }
    );

    await userModel.updateMany(
      { courseYear: "First Year B Batch", batch: "MBA" },
      { $set: { courseYear: "Second Year B Batch" } }
    );

    return res.status(200).json({ message: 'MBA course years updated successfully!' });
  } catch (error) {
    console.error('Error updating MBA course years:', error);
    return res.status(500).json({ message: 'An error occurred while updating MCA course years.' });
  }
});

app.delete('/api/mbadeleteStudents', async (req, res) => {
  try {
    // Delete only MCA students in Second Year
    await userModel.deleteMany({ courseYear: "Second Year A Batch", batch: "MBA" });
    await userModel.deleteMany({ courseYear: "Second Year B Batch", batch: "MBA" });

    return res.status(200).json({ message: 'MBA students in Second Year A and B have been deleted successfully!' });
  } catch (error) {
    console.error('Error deleting MCA students:', error);
    return res.status(500).json({ message: 'An error occurred while deleting MBA students.' });
  }
});


app.post('/api/btechupdateCourseYear', async (req, res) => {
  try {
    // Promote BTech students to the next year
    await userModel.updateMany(
      { courseYear: "First Year A Batch", batch: { $nin: ["MCA", "MBA"] } },
      { $set: { courseYear: "Second Year A Batch" } }
    );
    
    await userModel.updateMany(
      { courseYear: "First Year B Batch", batch: { $nin: ["MCA", "MBA"] } },
      { $set: { courseYear: "Second Year B Batch" } }
    );
    
    await userModel.updateMany(
      { courseYear: "Second Year A Batch", batch: { $nin: ["MCA", "MBA"] } },
      { $set: { courseYear: "Third Year A Batch" } }
    );
    
    await userModel.updateMany(
      { courseYear: "Second Year B Batch", batch: { $nin: ["MCA", "MBA"] } },
      { $set: { courseYear: "Third Year B Batch" } }
    );
    
    await userModel.updateMany(
      { courseYear: "Third Year A Batch", batch: { $nin: ["MCA", "MBA"] } },
      { $set: { courseYear: "Fourth Year A Batch" } }
    );
    
    await userModel.updateMany(
      { courseYear: "Third Year B Batch", batch: { $nin: ["MCA", "MBA"] } },
      { $set: { courseYear: "Fourth Year B Batch" } }
    );
    

    return res.status(200).json({ message: 'BTech course years updated successfully!' });
  } catch (error) {
    console.error('Error updating BTech course years:', error);
    return res.status(500).json({ message: 'An error occurred while updating BTech course years.' });
  }
});

app.delete('/api/btechdeleteStudents', async (req, res) => {
  try {
    // Delete only Fourth Year BTech students
    await userModel.deleteMany({
      courseYear: { $in: ["Fourth Year A Batch", "Fourth Year B Batch"] },
      batch: { $nin: ["MCA", "MBA"] }
    });
    

    return res.status(200).json({ message: 'BTech Fourth Year students have been deleted successfully!' });
  } catch (error) {
    console.error('Error deleting BTech students:', error);
    return res.status(500).json({ message: 'An error occurred while deleting BTech students.' });
  }
});

const nodemailer = require("nodemailer");

// Route to approve a user by ID
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rizwanps2001@gmail.com", // Replace with your email
    pass: "wxgzghrhdpxoezcm", // Use an App Password for security
  },
});

app.put("/approve/:id", async (req, res) => {
  try {
    // Find the user by ID
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update approval status
    await userModel.findByIdAndUpdate(req.params.id, { approved: true });

    // Email content
    const mailOptions = {
      from: "your-email@gmail.com",
      to: user.email,
      subject: "Account Approved ✅",
      text: `Hello ${user.name},\n\nYour account has been successfully approved. You can now log in and access all features.\n\nThank you!`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ message: "User approved and email sent successfully" });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});


app.delete('/users/delete/:id', async (req, res) => {
  try {
      const userId = req.params.id;
      const deletedUser = await userModel.findByIdAndDelete(userId);

      if (!deletedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

app.get("/mbaunapproved-users", async (req, res) => {
  try {
    const unapprovedUsers = await userModel.find({ approved: false, batch: "MBA" }); // Only MCA unapproved users
    const approvedUsers = await userModel.find({ approved: true, batch: "MBA" }); // Only MCA approved users

    res.json({ unapprovedUsers, approvedUsers }); // Send both approved and unapproved MCA users
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

app.get("/btech-unapproved-users", async (req, res) => {
  try {
    const unapprovedUsers = await userModel.find({ approved: false, batch: { $ne: "MCA", $ne: "MBA" } }); // Excludes MCA & MBA
    const approvedUsers = await userModel.find({ approved: true, batch: { $ne: "MCA", $ne: "MBA" } });

    res.json({ unapprovedUsers, approvedUsers }); // Returns both lists
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});


app.post("/AddJob", async (req, res) => {
  
  try {
   
      const newJob = new jobModel(req.body);
      await newJob.save();
      res.json({ "status": "success", "job": newJob });
  } catch (error) {
      res.json({ "status": "error", "message": error.message });
  }
});
// User Sign-In

app.post("/signin", async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });

      if (user) {
          // Check if the user is approved
          if (!user.approved) {
              // If the user is not approved, send the specific message
              return res.json({ status: "User is not approved by admin" });
          }

          // Check if the password is correct
          const passwordValid = bcrypt.compareSync(password, user.password);
          if (passwordValid) {
              const token = jwt.sign({ userId: user._id }, "mock", { expiresIn: "1d" });

              // Return user details along with the token
              res.json({
                  status: "success",
                  token: token,
                  user: {
                      _id: user._id,
                      name: user.name,
                      courseYear:user.courseYear,
                      admissionno: user.admissionno,
                      email: user.email,
                      timeSlot: user.timeSlot || "", // Use existing timeSlot or empty string
                      date: user.date || "",         // Use existing date or empty string
                  },
              });
          } else {
              res.json({ status: "incorrect password" });
          }
      } else {
          res.json({ status: "invalid email id" });
      }
  } catch (error) {
      res.json({ status: "error", message: error.message });
  }
});


app.get("/jobs", async (req, res) => {
  try {
      const jobs = await jobModel.find({}, 'title'); // Fetching only job titles and IDs
      res.json({ status: "success", jobs });
  } catch (error) {
      res.json({ status: "error", message: error.message });
  }
});


// View All Jobs
app.post("/ViewAllJob", async (req, res) => {
  try {
      const jobs = await jobModel.find();
      res.json(jobs);
  } catch (error) {
      res.json({ "status": "error", "message": error.message });
  }
});


// Example Backend Route
app.get('/ViewRegistrationss/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const registrations = await registrationModel.find({ user_id: userId }).populate('job_id');
    res.json({ registrations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});



// Register Job
app.post("/RegisterJob", async (req, res) => {
  const { user_id, job_id } = req.body; // Extract user_id and job_id from the request body

  try {
      // Check if registration already exists
      const existingRegistration = await registrationModel.findOne({
          user_id: user_id,
          job_id: job_id
      });

      if (existingRegistration) {
          return res.json({ "status": "already registered" });
      }

      // Create a new registration
      const registration = new registrationModel({
          user_id: user_id,
          job_id: job_id,
      });

      await registration.save();
      res.json({ "status": "success", "registration": registration });

  } catch (error) {
      res.json({ "status": "error", "message": error.message });
  }
});

app.get("/jobs/:jobId/mcaregistrations", async (req, res) => {
  const { jobId } = req.params;
  try {
      const registrations = await registrationModel.find({ job_id: jobId })
          .populate({
              path: 'user_id',
              match: { batch: /MCA/i }, // 🔹 Filter only MCA students
              select: 'name admissionno phoneno email rollno courseYear'
          })
          .select('applied_at');

      // Filter out null values (cases where `match` didn't find MCA students)
      const filteredRegistrations = registrations.filter(reg => reg.user_id !== null);

      res.json({ status: "success", registrations: filteredRegistrations });
  } catch (error) {
      res.json({ status: "error", message: error.message });
  }
});
app.get('/api/job-submissionss', async (req, res) => {
  try {
    const jobSubmissions = await Jobsubmission.find({});
    res.status(200).json(jobSubmissions);
  } catch (error) {
    console.error('Error fetching job submissions:', error);
    res.status(500).json({ message: 'Error fetching job submissions' });
  }
});

// Route to delete a job submission by ID
app.delete('/api/job-submissionss/:id', async (req, res) => {
  try {
    const deleteResult = await Jobsubmission.findByIdAndDelete(req.params.id);
    if (deleteResult) {
      res.status(200).json({ message: 'Job submission deleted successfully' });
    } else {
      res.status(404).json({ message: 'Job submission not found' });
    }
  } catch (error) {
    console.error('Error deleting job submission:', error);
    res.status(500).json({ message: 'Error deleting job submission' });
  }
});
app.get('/api/job-submissionss', async (req, res) => {
  try {
    const jobSubmissions = await Jobsubmission.find({});
    res.status(200).json(jobSubmissions);
  } catch (error) {
    console.error('Error fetching job submissions:', error);
    res.status(500).json({ message: 'Error fetching job submissions' });
  }
});

// Route to delete a job submission by ID
app.delete('/api/job-submissionss/:id', async (req, res) => {
  try {
    const deleteResult = await Jobsubmission.findByIdAndDelete(req.params.id);
    if (deleteResult) {
      res.status(200).json({ message: 'Job submission deleted successfully' });
    } else {
      res.status(404).json({ message: 'Job submission not found' });
    }
  } catch (error) {
    console.error('Error deleting job submission:', error);
    res.status(500).json({ message: 'Error deleting job submission' });
  }
});

app.get("/api/jobsss", async (req, res) => {
    try {
        const jobs = await jobModel.find();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching jobs", error });
    }
});

// Route to delete a job by ID
app.delete("/api/jobs/:id", async (req, res) => {
    const jobId = req.params.id;
    try {
        await jobModel.findByIdAndDelete(jobId);
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting job", error });
    }
});


app.delete("/api/registrations/:jobId", async (req, res) => {
  const { jobId } = req.params;
  try {
      const deletedRegistrations = await registrationModel.deleteMany({ job_id: jobId });
      if (deletedRegistrations.deletedCount === 0) {
          return res.status(404).json({ message: "No registrations found for this job ID" });
      }
      res.status(200).json({ message: "All registrations deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error deleting registrations", error });
  }
});

app.get("/jobs/:jobId/mbaregistrations", async (req, res) => {
  const { jobId } = req.params;
  try {
      const registrations = await registrationModel.find({ job_id: jobId })
          .populate({
              path: 'user_id',
              match: { batch: /MBA/i }, // 🔹 Filter only MCA students
              select: 'name admissionno phoneno email rollno courseYear'
          })
          .select('applied_at');

      // Filter out null values (cases where `match` didn't find MCA students)
      const filteredRegistrations = registrations.filter(reg => reg.user_id !== null);

      res.json({ status: "success", registrations: filteredRegistrations });
  } catch (error) {
      res.json({ status: "error", message: error.message });
  }
});


app.get("/jobs/:jobId/btechregistrations", async (req, res) => {
  const { jobId } = req.params;
  try {
      const registrations = await registrationModel.find({ job_id: jobId })
          .populate({
              path: 'user_id',
              match: { 
                  batch: { 
                       // ✅ Matches "BTech" and "B.Tech"
                      $nin: ["MCA", "MBA"] // ❌ Excludes MCA and MBA
                  } 
              },
              select: 'name admissionno phoneno email rollno courseYear batch'
          })
          .select('applied_at');

      // Filter out null values (cases where `match` didn't find B.Tech students)
      const filteredRegistrations = registrations.filter(reg => reg.user_id !== null);

      res.json({ status: "success", registrations: filteredRegistrations });
  } catch (error) {
      res.json({ status: "error", message: error.message });
  }
});

app.post('/api/questions', async (req, res) => {
  const questions = req.body;

  // Log the incoming request body
  console.log('Incoming questions:', questions);

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'No questions provided' });
  }

  const week = questions[0].week;
  const company = questions[0].company;

  // Validate that all questions are for the same week and company
  const validQuestions = questions.every(q => q.week === week && q.company === company);

  if (!validQuestions) {
    return res.status(400).json({ error: 'All questions must be for the same week and company' });
  }

  try {
    // Insert multiple questions into the database
    const result = await Question.insertMany(questions);
    res.status(201).json({ message: 'Questions added successfully!', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get('/api/companies', async (req, res) => {
  try {
    // Use distinct to get unique company names
    const companyNames = await Question.distinct('company');
    res.json(companyNames);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Server error while fetching companies' });
  }
});


app.get('/api/filter-questions/:week/:company', async (req, res) => {
  const week = parseInt(req.params.week, 10); // Parse week as an integer
  const company = req.params.company; // Get the company from request parameters

  try {
    // Find all questions for the given week and company
    const questions = await Question.find({ week: week, company: company });
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this week and company' });
    }
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching questions for this week and company' });
  }
});

app.get('/api/weekssss', async (req, res) => {
  const { company } = req.query;

  if (!company) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  try {
    // Fetch distinct weeks based on the specified company
    const weeks = await Question.find({ company }).select('week');
    const uniqueWeeks = [...new Set(weeks.map((w) => w.week))]; // Get distinct weeks
    res.json(uniqueWeeks);
  } catch (error) {
    console.error('Error fetching weeks:', error);
    res.status(500).json({ error: 'Server error while fetching weeks' });
  }
});

app.put('/api/update-questionss', async (req, res) => {
  const { questions } = req.body;

  try {
    // Loop through each question and update it in the database
    for (let updatedQuestion of questions) {
      const { _id, question, options, answer, explanation } = updatedQuestion;

      // Find the question by ID and update its fields
      await Question.findByIdAndUpdate(
        _id,
        {
          question,
          options,
          answer,
          explanation,
        },
        { new: true } // Return the updated document
      );
    }

    // If everything is successful, send a success response
    res.status(200).json({ message: 'Questions updated successfully!' });
  } catch (error) {
    console.error('Error updating questions:', error);
    res.status(500).json({ message: 'Error updating questions.', error });
  }
});

app.get('/api/available-weekss', async (req, res) => {
  try {
    const weeks = await Question.distinct('week'); // Get distinct weeks
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weeks' });
  }
});

  
  // Route to handle quiz submission and evaluate answers
  app.post('/api/submit-quiz', async (req, res) => {
    const { week, answers, dueDate,company,totalQuestions} = req.body; // Include dueDate in the request
  
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'No answers provided' });
    }
  
    try {
      // Extract userId from token
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
  
      const decoded = jwt.verify(token, 'mock'); // Use your secret
      const userId = decoded.userId;
  
      // Check if the user has already submitted the quiz for this week
      const existingSubmission = await Submission.findOne({ week, userId,company});
      if (existingSubmission) {
        return res.status(403).json({ message: 'You have already submitted the quiz for this week.' });
      }
  
      // Fetch questions for the specified week
      const questions = await Question.find({ week });
      if (!questions.length) {
        return res.status(404).json({ message: 'No questions found for this week' });
      }
  
      // Create a map for quick lookup of correct answers
      const correctAnswersMap = questions.reduce((acc, question) => {
        acc[question._id.toString()] = question.answer;
        return acc;
      }, {});
  
      // Evaluate answers and calculate score
      let score = 0;
      const results = answers.map(answer => {
        const correctAnswer = correctAnswersMap[answer.questionId];
        const isCorrect = correctAnswer && correctAnswer === answer.answer;
        if (isCorrect) {
          score++;
        }
        return {
          questionId: answer.questionId,
          userAnswer: answer.answer,
          correctAnswer,
          isCorrect,
          company,
        };
      });
  
      // Save submission to the database with the userId and dueDate
      const newSubmission = new Submission({
        week,
        userId,
        answers,
        score,
        company,
        submissionTime: new Date(), // Save submission time
        dueDate: dueDate,
        totalQuestions,
         // Save the due date
      });
      await newSubmission.save();
  
      res.json({
        score,
        totalQuestions: questions.length,
        results,
      });
    } catch (error) {
      console.error('Error processing quiz submission:', error.message);
      res.status(500).json({ message: 'Error processing quiz submission', error: error.message });
    }
  });
  app.get('/api/company/:company/week/:week', async (req, res) => {
    const { company, week } = req.params;
    try {
        let questions = await Question.find({ company: company, week });

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this company and week.' });
        }

        // Shuffle the questions array
        questions = questions.sort(() => Math.random() - 0.5);

        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
});


  
// POST route to submit admin answers
app.post('/api/submit-answerss', async (req, res) => {
  const userAnswers = req.body; // Expecting an array of user answers

  try {
    // Ensure the request body is valid
    if (!Array.isArray(userAnswers) || userAnswers.length === 0) {
      throw new Error('Invalid input: Expected an array of user answers.');
    }

    // Prepare each answer with questionId and other details
    const answersToInsert = userAnswers.map(answer => ({
      week: answer.week,
      questionId: answer.questionId, // Ensure this matches your updated schema field
      answer: answer.answer,
      explanation: answer.explanation, // Optional field if needed
      submittedAt: new Date(),
      company:answer.company,
    }));

    // Insert all user answers into the database
    await userAnswer.insertMany(answersToInsert);

    res.status(201).json({ message: 'Answers submitted successfully!' });
  } catch (error) {
    // Enhanced error logging
    console.error('Error submitting answers:', error.message, { stack: error.stack, body: req.body });
    res.status(500).json({ message: 'Error submitting answers.', error: error.message });
  }
});

app.get('/api/user-answers/:week/:company?', async (req, res) => {
  const { week, company } = req.params;

  try {
    // Build query object based on parameters
    let query = { week };
    if (company) {
      query.company = company; // Assuming your userAnswer schema has a 'company' field
    }

    // Find answers for the given week and populate the question details
    const answers = await userAnswer.find(query)
      .populate({
        path: 'questionId', // Ensure the questionId path matches your schema
        select: 'question options answer explanation' // Specify fields to populate
      })
      .exec();

    res.status(200).json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ message: 'Error fetching answers.' });
  }
});


app.get('/api/available-companies', async (req, res) => {
  try {
    const companies = await userAnswer.distinct('company'); // Assuming your userAnswer schema has a 'company' field
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Error fetching companies.' });
  }
});


// Route to get scores for selected week range
app.get('/api/scores/:startWeek/:endWeek', async (req, res) => {
  const { startWeek, endWeek } = req.params;

  try {
    // Fetch submissions for the selected week range, excluding entries with null or non-existing userId
    const submissions = await Submission.find({
      week: { $gte: parseInt(startWeek), $lte: parseInt(endWeek) },
      userId: { $ne: null } // Exclude submissions with null userId
    }).populate('userId', 'name admissionno rollno courseYear email score');

    // Aggregate scores per user, ensuring the userId is valid
    const userScores = {};
    submissions.forEach((submission) => {
      // Check if the user data is present and valid
      if (submission.userId && submission.userId._id) {
        if (!userScores[submission.userId._id]) {
          userScores[submission.userId._id] = {
            user: submission.userId,
            score: 0,
          };
        }
        userScores[submission.userId._id].score += submission.score;
      }
    });

    // Convert to array
    const scoresArray = Object.values(userScores);
    res.json(scoresArray);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).send('Server Error');
  }
});



app.get('/api/mbascoresss/:startWeek/:endWeek', async (req, res) => {
  const { startWeek, endWeek } = req.params;

  try {
    // Fetch submissions for the selected week range, including only MBA students
    const submissions = await Submission.find({
      week: { $gte: parseInt(startWeek), $lte: parseInt(endWeek) },
      userId: { $ne: null } // Exclude submissions with null userId
    }).populate({
      path: 'userId',
      select: 'name admissionno rollno courseYear email score',
      match: { batch: /MBA/i } // Filter only MBA students
    });

    // Aggregate scores per user, ensuring only MBA users are included
    const userScores = {};
    submissions.forEach((submission) => {
      if (submission.userId && submission.userId._id) {
        if (!userScores[submission.userId._id]) {
          userScores[submission.userId._id] = {
            user: submission.userId,
            score: 0,
          };
        }
        userScores[submission.userId._id].score += submission.score;
      }
    });

    // Convert to array
    const scoresArray = Object.values(userScores);
    res.json(scoresArray);
  } catch (error) {
    console.error('Error fetching MBA scores:', error);
    res.status(500).send('Server Error');
  }
});


app.get('/api/week-ranges', async (req, res) => {
  try {
    const maxWeek = await Submission.find()
      .sort({ week: -1 })
      .limit(1)
      .select('week');

    const ranges = [];
    if (maxWeek.length > 0) {
      const currentMaxWeek = maxWeek[0].week;
      for (let i = 1; i <= currentMaxWeek; i += 4) {
        if (i + 3 <= currentMaxWeek) {
          ranges.push(`Week ${i} to Week ${i + 3}`);
          console.log(maxWeek);
        }
      }
    }
    res.json(ranges);
  } catch (error) {
    console.error('Error fetching week ranges:', error);
    res.status(500).send('Server Error');
  }
});
   // Fetch user submissions
   app.get("/api/submissionsss", async (req, res) => {
    try {
      const userId = req.headers['user-id']; // Retrieve userId from headers
  
      if (!userId) {
        return res.status(403).json({ status: "error", message: "User not logged in" });
      }
  
      const submissions = await Submission.find({ userId })
        .select("week score submissionTime company")
        .exec();
  
      if (!submissions.length) {
        return res.status(404).json({ status: "error", message: "No submissions found for this user" });
      }
  
      res.json({ status: "success", submissions });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });
  
app.get('/api/mcasubmissions-and-non-submissions/:week', async (req, res) => {
  
  const weekNumber = req.params.week;
  const { courseYear, company } = req.query; // Capture courseYear and company from the query

  try {
    // Build a filter to fetch only MCA students.
    // Assumes that the user model contains a field "course" with value "MCA".
    const userFilter = { batch: 'MCA' };
    if (courseYear) {
      userFilter.courseYear = courseYear;
    }

    // Fetch all MCA users with the specified courseYear (if provided)
    const users = await userModel
      .find(userFilter)
      .select('name email admissionno rollno courseYear')
      .exec();

    // Build submission filter based on week and, if provided, company
    const submissionFilter = { week: weekNumber };
    if (company) {
      submissionFilter.company = company;
    }

    // Fetch all submissions matching the week and company, and populate the userId field,
    // matching only MCA students.
    const submissions = await Submission.find(submissionFilter)
      .populate({
        path: 'userId',
        select: 'email name admissionno rollno courseYear',
        match: userFilter,
      })
      .select('submissionTime score dueDate company')
      .exec();

    // Filter out submissions where the populated userId is null
    const validSubmissions = submissions.filter(submission => submission.userId);

    // Create a set of user IDs that have submitted for the specified week and company
    const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

    // Determine users who have not submitted
    const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

    // Respond with both valid submissions and the list of non-submitted MCA users
    res.json({
      submissions: validSubmissions,
      nonSubmittedUsers,
    });
  } catch (error) {
    console.error('Error fetching submissions and non-submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions and non-submissions', error: error.message });
  }
});

app.get('/api/mbasubmissions-and-non-submissions/:week', async (req, res) => {
  const weekNumber = req.params.week;
  const { courseYear, company } = req.query; // Capture courseYear and company from the query

  try {
    // Build a filter to fetch only MCA students.
    // Assumes that the user model contains a field "course" with value "MCA".
    const userFilter = { batch: 'MBA' };
    if (courseYear) {
      userFilter.courseYear = courseYear;
    }

    // Fetch all MCA users with the specified courseYear (if provided)
    const users = await userModel
      .find(userFilter)
      .select('name email admissionno rollno courseYear')
      .exec();

    // Build submission filter based on week and, if provided, company
    const submissionFilter = { week: weekNumber };
    if (company) {
      submissionFilter.company = company;
    }

    // Fetch all submissions matching the week and company, and populate the userId field,
    // matching only MCA students.
    const submissions = await Submission.find(submissionFilter)
      .populate({
        path: 'userId',
        select: 'email name admissionno rollno courseYear',
        match: userFilter,
      })
      .select('submissionTime score dueDate company')
      .exec();

    // Filter out submissions where the populated userId is null
    const validSubmissions = submissions.filter(submission => submission.userId);

    // Create a set of user IDs that have submitted for the specified week and company
    const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

    // Determine users who have not submitted
    const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

    // Respond with both valid submissions and the list of non-submitted MCA users
    res.json({
      submissions: validSubmissions,
      nonSubmittedUsers,
    });
  } catch (error) {
    console.error('Error fetching submissions and non-submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions and non-submissions', error: error.message });
  }
});
app.get('/api/unique-quizzes', async (req, res) => {
  try {
    const uniqueQuizzes = await Question.aggregate([
      {
        $group: {
          _id: { company: "$company", week: "$week" },
        }
      },
      {
        $project: {
          company: "$_id.company",
          week: "$_id.week",
          _id: 0
        }
      }
    ]);
    res.json(uniqueQuizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching unique quizzes" });
  }
});


app.delete('/api/delete/company/:company/week/:week', async (req, res) => {
  const { company, week } = req.params;

  try {
    // Delete quizzes for the specified company and week
    const quizDeleteResult = await Question.deleteMany({ company, week });

    // Delete user answers associated with the specified company and week
    const userAnswerDeleteResult = await userAnswer.deleteMany({ company, week });

    if (quizDeleteResult.deletedCount > 0 || userAnswerDeleteResult.deletedCount > 0) {
      return res.status(200).json({
        message: `Deleted all quizzes and user answers for ${company} in week ${week}`,
      });
    } else {
      return res.status(404).json({
        message: 'No matching quizzes or user answers found to delete',
      });
    }
  } catch (error) {
    console.error('Error deleting quiz and user answers:', error);
    return res.status(500).json({ message: 'Error deleting quiz and user answers' });
  }
});

app.delete('/api/submissions/company/:company/week/:week', async (req, res) => {
  const { company, week } = req.params;
  try {
    const result = await Submission.deleteMany({ company, week: parseInt(week) });
    res.json({ message: `Deleted submissions for ${company} in week ${week}`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting submissions:', error);
    res.status(500).json({ message: 'Error deleting submissions' });
  }
});

//quiz submission weeks
app.get('/api/weeks', async (req, res) => {
  try {
    const weeks = await Question.distinct('week');
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch submissions and non-submissions for a specific week (only for users not in MCA or MBA)
app.get('/api/submissions-and-non-submissions/not-mca-mba/:week', async (req, res) => {
  const weekNumber = req.params.week;
  const { courseYear, company } = req.query; // Capture courseYear and company from the query

  try {
    // Build a user filter for students not in MCA or MBA.
    const userFilter = { batch: { $nin: ['MCA', 'MBA'] } };
    if (courseYear) {
      userFilter.courseYear = courseYear;
    }

    // Fetch all users matching the filter
    const users = await userModel
      .find(userFilter)
      .select('name email admissionno rollno courseYear')
      .exec();

    // Build a submission filter based on week and company
    const submissionFilter = { week: weekNumber };
    if (company) {
      submissionFilter.company = company;
    }

    // Fetch submissions matching the filter and populate the userId field, using the userFilter
    const submissions = await Submission.find(submissionFilter)
      .populate({
        path: 'userId',
        select: 'email name admissionno rollno courseYear',
        match: userFilter,
      })
      .select('submissionTime score dueDate company')
      .exec();

    // Filter out submissions with a non-populated userId (i.e. that didn't match our filter)
    const validSubmissions = submissions.filter(submission => submission.userId);

    // Create a set of userIds that have submitted for the specified week and company
    const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

    // Determine users who haven't submitted for the specified week and company
    const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

    // Respond with both valid submissions and the list of non-submitted users
    res.json({
      submissions: validSubmissions,
      nonSubmittedUsers,
    });
  } catch (error) {
    console.error('Error fetching submissions and non-submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions and non-submissions', error: error.message });
  }
});


app.post('/api/cquestions', (req, res) => {
  const { title, description, inputFormat, outputFormat, testCases, difficulty, week, dueDate, company } = req.body;

  // Check if all required fields are present, including dueDate and company
  if (!title || !description || !inputFormat || !outputFormat || !testCases || !difficulty || !week || !dueDate || !company) {
      return res.status(400).json({ error: 'All fields are required, including the due date and company.' });
  }

  // Create a new question object using the Cquestions model
  const newcQuestions = new Cquestions({
      title,
      description,
      inputFormat,
      outputFormat,
      testCases: testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })), // Map each test case
      difficulty,
      week,
      dueDate, // Include dueDate in the object
      company // Include company in the object
  });

  // Save the question to the database
  newcQuestions.save()
      .then(() => res.status(201).json({ message: 'Question added successfully!' }))
      .catch(err => res.status(500).json({ error: err.message }));
});

 
    // Get all unique weeks from questions
    app.get('/api/companiesss', async (req, res) => {
      try {
          const companies = await Cquestions.distinct('company'); // Fetch unique companies
          res.json(companies);
      } catch (error) {
          console.error('Error fetching companies:', error);
          res.status(500).json({ message: 'Error fetching companies' });
      }
  });
    // Get all questions for a specific week
    app.get('/api/weeks/:company', async (req, res) => {
      const { company } = req.params;
      try {
          const questions = await Cquestions.find({ company });
          const weeks = [...new Set(questions.map(q => q.week))]; // Get unique weeks
          res.json(weeks);
      } catch (error) {
          console.error('Error fetching weeks:', error);
          res.status(500).json({ message: 'Error fetching weeks' });
      }
  });
    
  app.get('/api/cquestions/week/:week/company/:company', async (req, res) => {
    const { week, company } = req.params;
    try {
        const questions = await Cquestions.find({ week, company });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching questions for the selected week and company' });
    }
});

const executeCode = (code, language, input, callback) => {
  const fileName = `Main.${language === 'python' ? 'py' : language === 'java' ? 'java' : 'c'}`;
  fs.writeFileSync(fileName, code);

  let command, args;

  switch (language) {
    case 'python':
      command = 'python';
      args = [fileName];

      const pythonProcess = spawn(command, args);
      let pythonOutput = '';
      let pythonError = '';

      pythonProcess.stdin.write(input);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // Regular expression to remove file paths and unwanted characters
        const pathRegex = /File ".*Main\.py", /g;
        pythonError = pythonError.replace(pathRegex, ''); // Remove file path
        pythonError = pythonError.replace(/["',]/g, ''); // Remove ", and '

        if (code !== 0) {
          callback(pythonError.trim(), null);
        } else {
          callback(null, pythonOutput.trim());
        }
      });
      return;
    case 'java':
      command = 'javac';
      args = [fileName];

      const compileProcess = spawn(command, args);
      let compileError = ''; // To capture Java compilation errors

      compileProcess.stderr.on('data', (data) => {
        compileError += data.toString();
      });

      compileProcess.on('close', (code) => {
        if (code !== 0) {
          compileError = compileError.replace(/Main\.java:\d+:\s/g, ''); // Remove file name from Java errors
          return callback(compileError.trim(), null);
        }

        const runProcess = spawn('java', ['Main']);
        let output = '';
        let error = '';

        runProcess.stdin.write(input);
        runProcess.stdin.end();

        runProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        runProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        runProcess.on('close', (code) => {
          error = error.replace(/Exception in thread "main" java\.lang\..*Main\.java:\d+/, ''); // Remove file name from Java runtime errors
          
          if (code !== 0) {
            callback(error.trim(), null);
          } else {
            callback(null, output.trim());
          }
        });
      });
      return;

    case 'c':
      command = 'gcc';
      args = [fileName, '-o', 'code'];

      const compileCProcess = spawn(command, args);
      let compileCError = ''; // To capture C compilation errors

      compileCProcess.stderr.on('data', (data) => {
        compileCError += data.toString();
      });

      compileCProcess.on('close', (compileCode) => {
        if (compileCode !== 0) {
          // Remove file references from C compilation errors
          compileCError = compileCError.replace(/Main\.c:\d+:\d+:/g, ''); 
          compileCError = compileCError.replace(/\[-W.*\]/g, ''); // Remove warning codes
          return callback(compileCError.trim(), null);
        }
    
        const runCProcess = spawn('./code');
        let output = '';
        let error = '';
    
        runCProcess.stdin.write(input);
        runCProcess.stdin.end();
    
        runCProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
    
        runCProcess.stderr.on('data', (data) => {
          error += data.toString();
        });
    
        runCProcess.on('close', (runCode) => {
          // Remove file references from C runtime errors
          error = error.replace(/Main\.c:\d+:\d+:/g, '');
          
          if (runCode !== 0) {
            callback(error.trim(), null);
          } else {
            callback(null, output.trim());
          }
        });
      });
      return;

    default:
      return callback('Unsupported language', null);
  }
};

// API route to run code
app.post('/api/compiler/run', (req, res) => {
  const { code, language, input } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  executeCode(code, language, input, (error, output) => {
    if (error) {
      return res.status(400).json({
        success: false,
        error: error, // Send exact error here
      });
    }

    res.json({
      success: true,
      output: output,
    });
  });
});

    // CompilerSubmission endpoint
    
    app.post('/api/compilerSubmissions', async (req, res) => {
      const { userId, week, questionId, passedCount, totalTestCases, testResults, dueDate , code ,company } = req.body;
  
      // Validate required fields
      if (!userId || !week || !questionId || passedCount === undefined || !totalTestCases || !testResults || !dueDate) {
          return res.status(400).json({ error: 'All fields are required.' });
      }
  
      try {
          // Check if the user has already submitted for this week and question
          const existingSubmission = await CompilerSubmission.findOne({ userId, week, questionId,company, });
          if (existingSubmission) {
              return res.status(400).json({ error: 'You have already submitted for this week.' });
          }
  
          // Get the current date and time
          const submissionDate = new Date();
  
          // Determine if the submission is late
          const isLate = submissionDate > new Date(dueDate);
  
          // Create new submission object
          const newCompilerSubmission = new CompilerSubmission({
              userId,
              week,
              questionId,
              passedCount,
              totalTestCases,
              testResults,
              submissionDate,  // Add date of submission
              dueDate,         // Include due date
              isLate, 
              code,
              company,
                    // Include late status based on comparison
          });
  
          // Save submission to database
          await newCompilerSubmission.save();
          return res.status(201).json({ message: 'Submission recorded successfully!' });
      } catch (err) {
          console.error('Error saving submission:', err);
          return res.status(500).json({ error: 'Failed to record submission. Please try again later.' });
      }
  });

// Submission Route
    // Fetch all submissions grouped by week with user details
    app.get('/api/compilerSubmissionss', async (req, res) => {
      try {
        // Fetch submissions and populate userId
        const submissions = await CompilerSubmission.find({})
          .populate('userId', 'name admissionno'); // Populate name and admissionNo from the User model
    
        // Filter out submissions where userId is null
        const filteredSubmissions = submissions.filter(submission => submission.userId !== null);
    
        // Group submissions by week
        const groupedSubmissions = filteredSubmissions.reduce((acc, submission) => {
          const week = submission.week;
          if (!acc[week]) {
            acc[week] = [];
          }
          acc[week].push({
            _id: submission._id,
            userId: submission.userId._id,
            company:submission.company,
            name: submission.userId.name,
            admissionno: submission.userId.admissionno,
            passedCount: submission.passedCount,
            totalTestCases: submission.totalTestCases,
         
          });
          return acc;
        }, {});
    
        res.json(groupedSubmissions);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    
   // Fetch all submissions grouped by week with user details
   app.get('/api/compilerSubmissionss', async (req, res) => {
    try {
      // Fetch submissions and populate userId
      const submissions = await CompilerSubmission.find({})
        .populate('userId', 'name admissionno'); // Populate name and admissionNo from the User model
  
      // Filter out submissions where userId is null
      const filteredSubmissions = submissions.filter(submission => submission.userId !== null);
  
      // Group submissions by week
      const groupedSubmissions = filteredSubmissions.reduce((acc, submission) => {
        const week = submission.week;
        if (!acc[week]) {
          acc[week] = [];
        }
        acc[week].push({
          _id: submission._id,
          userId: submission.userId._id,
          company:submission.company,
          name: submission.userId.name,
          admissionno: submission.userId.admissionno,
          passedCount: submission.passedCount,
          totalTestCases: submission.totalTestCases,
       
        });
        return acc;
      }, {});
  
      res.json(groupedSubmissions);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
      // Fetch submissions for a specific week with user details
      app.get('/api/compilerSubmissions/week/:week', async (req, res) => {
        const { week } = req.params;
        const { courseYear, searchTerm, company } = req.query; // Extract company from query params
    
        const weekNumber = parseInt(week);
        if (isNaN(weekNumber) || weekNumber <= 0) {
            return res.status(400).json({ error: 'Invalid week number provided' });
        }
    
        try {
            // Build the user query based on course year, search term, and company
            let userQuery = {};
    
            if (courseYear) {
                userQuery.courseYear = courseYear; // Filter users by course year if provided
            }
    
            if (searchTerm) {
                userQuery.$or = [
                    { name: new RegExp(searchTerm, 'i') },
                    { admissionno: new RegExp(searchTerm, 'i') },
                    { email: new RegExp(searchTerm, 'i') },
                ];
            }
    
            // Fetch all users matching the query (apply the course year and search term filter)
            const users = await userModel.find(userQuery).select('name admissionno email rollno courseYear').exec();
    
            // Fetch submissions for the given week and populate user details
            const submissions = await CompilerSubmission.find({ week: weekNumber })
                .populate('userId', 'name admissionno email rollno courseYear company'); // Populate company too
    
            // List of user IDs who submitted
            const submittedUserIds = submissions.map(sub => sub.userId ? sub.userId._id.toString() : null).filter(id => id !== null);
    
            // Users who submitted with courseYear, searchTerm, and company filters
            const filteredSubmissions = submissions.filter(sub => {
                const userId = sub.userId;
    
                if (!userId) return false; // Skip submissions without userId
    
                // Apply courseYear filter if provided
                const courseYearMatches = !courseYear || userId.courseYear === courseYear;
    
                // Apply search term filter
                const searchMatches = !searchTerm || new RegExp(searchTerm, 'i').test(userId.name) ||
                    new RegExp(searchTerm, 'i').test(userId.admissionno) ||
                    new RegExp(searchTerm, 'i').test(userId.email);
    
                // Apply company filter if provided
                const companyMatches = !company || userId.company === company; // Check for company match
    
                return courseYearMatches && searchMatches && companyMatches;
            });
    
            // Users who haven't submitted, also filtered by searchTerm, courseYear, and company
            const nonSubmittedUsers = users.filter(user => {
                const hasNotSubmitted = !submittedUserIds.includes(user._id.toString());
                const searchMatches = !searchTerm || new RegExp(searchTerm, 'i').test(user.name) ||
                    new RegExp(searchTerm, 'i').test(user.admissionno) ||
                    new RegExp(searchTerm, 'i').test(user.email);
                const companyMatches = !company || user.company === company; // Check for company match
    
                return hasNotSubmitted && searchMatches && companyMatches;
            });
    
            // Prepare response data for submissions, including dueDate
            const submissionData = filteredSubmissions.map(submission => {
                const userId = submission.userId; // Ensure userId is defined
                return {
                    _id: submission._id,
                    userId: userId ? userId._id : null,
                    name: userId ? userId.name : 'N/A',
                    admissionno: userId ? userId.admissionno : 'N/A',
                    rollno: userId ? userId.rollno : 'N/A',
                    courseYear: userId ? userId.courseYear : 'N/A',
                    email: userId ? userId.email : 'N/A',
                    company: userId ? userId.company : 'N/A', // Include company in the response
                    passedCount: submission.passedCount,
                    totalTestCases: submission.totalTestCases,
                    submissionTime: submission.submissionDate,
                    dueDate: submission.dueDate,
                    company:submission.company
                };
            });
    
            res.json({
                submissions: submissionData,
                nonSubmittedUsers,
            });
        } catch (err) {
            console.error('Error fetching submissions:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    app.get('/api/cquestionss', async (req, res) => {
      const week = parseInt(req.query.week);
      if (isNaN(week)) {
          return res.status(400).json({ message: 'Invalid week number' });
      }
    
      try {
          const questions = await Cquestions.find({ week });
          res.json(questions);
      } catch (error) {
          res.status(500).json({ message: 'Error retrieving questions', error });
      }
    });
    
    
app.get('/api/compiler/week/:week', async (req, res) => {
  const { week } = req.params;

  try {
      // Fetch submissions for the selected week where passedCount is equal to totalTestCases
      const submissions = await CompilerSubmission.find({
          week,
          $expr: { $eq: ['$passedCount', '$totalTestCases'] }, // Ensure all test cases passed
      })
      .populate('questionId', 'title')
      .select('company questionId passedCount totalTestCases code')  // Populate with question title; adjust the fields as necessary
      .exec();

      if (submissions.length === 0) {
          return res.status(404).json({ message: 'No passed submissions found for the selected week.' });
      }

      res.json(submissions);
  } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/compiler/weeks', async (req, res) => {
  try {
      const weeks = await CompilerSubmission.distinct('week'); // Fetch distinct weeks from submissions
      res.json(weeks);
  } catch (error) {
      console.error('Error fetching weeks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Fetch questions for a specific week
app.get('/api/questions/week/:week', async (req, res) => {
  const { week } = req.params;

  try {
      const questions = await Cquestions.find({ week });
      if (questions.length === 0) {
          return res.status(404).json({ message: 'No questions found for this week.' });
      }
      res.status(200).json(questions);
  } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

  
    // Fetch user compiler submissions
    app.get('/api/compiler-submissionsss', async (req, res) => {
      try {
          // Retrieve userId from session storage or request headers
          const userId = req.headers['user-id'] // Adjust this if you're using a different method
    
          // Fetch submissions for the logged-in user
          const submissions = await CompilerSubmission.find({ userId })
              .select('week submissionDate passedCount totalTestCases company') // Select only the fields you need
              .exec();
    
          // Check if submissions were found
          if (!submissions.length) {
              return res.status(404).json({ message: 'No submissions found for this user' });
          }
    
          res.json({ status: 'success', submissions });
      } catch (error) {
          console.error('No Submissions Found:', error);
          res.status(500).json({ status: 'error', message: error.message });
      }
    });
    
// Fetch passed test cases for a specific week with populated questionId
app.get('/api/passedTestCases/week/:week', async (req, res) => {
  const { week } = req.params;
  try {
      const passedTestCases = await PassedTestCase.find({ week })
          .populate('questionId', 'title')
          .exec();

      if (!passedTestCases || passedTestCases.length === 0) {
          return res.status(404).json({ message: `No passed test cases found for week ${week}.` });
      }

      res.json(passedTestCases);
  } catch (error) {
      console.error('Error fetching passed test cases:', error);
      res.status(500).json({ message: 'Error fetching passed test cases', error });
  }
});


app.post('/api/compiler/save', async (req, res) => {
  const { week, questionId, code, passedCount, totalTestCases,questionTitle,company } = req.body;

  try {
      const newPassedTestCase = new PassedTestCase({
          week,
          questionTitle,
          questionId,
          code,
          passedCount,
          totalTestCases,
          company
      });

      await newPassedTestCase.save();
      res.status(201).json({ message: 'Data saved successfully', newPassedTestCase });
  } catch (err) {
      console.error('Error saving passed test case:', err);
      res.status(500).json({ message: 'Error saving data. Please try again.' });
  }
});


app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Cquestions.find({}, 'company week'); // Fetch only company and week fields
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
});

// API to delete quiz and answers for a specific company and week
app.delete('/api/delete-quiz', async (req, res) => {
  const { company, week } = req.query;

  try {
    // Delete the quiz entries in Cquestions collection
    const quizDeleteResult = await Cquestions.deleteMany({ company, week });

    // If quizzes are deleted, proceed to delete related PassedTestCase entries
    if (quizDeleteResult.deletedCount > 0) {
      const passedTestCaseDeleteResult = await PassedTestCase.deleteMany({ company, week });

      res.status(200).json({
        message: `Successfully deleted quiz for ${company} in week ${week}, along with ${passedTestCaseDeleteResult.deletedCount} related PassedTestCase entries.`,
      });
    } else {
      res.status(404).json({ message: 'No matching quizzes found to delete' });
    }
  } catch (error) {
    console.error('Error deleting quiz or related data:', error);
    res.status(500).json({ message: 'Error deleting quiz or related data' });
  }
});

// API to delete submissions for a specific company and week
app.delete('/api/delete-submission', async (req, res) => {
  const { company, week } = req.query;

  try {
    const deleteResult = await CompilerSubmission.deleteMany({ company, week });

    if (deleteResult.deletedCount > 0) {
      res.status(200).json({ message: `Deleted all submissions for ${company} in week ${week}` });
    } else {
      res.status(404).json({ message: 'No matching submissions found to delete' });
    }
  } catch (error) {
    console.error('Error deleting submissions:', error);
    res.status(500).json({ message: 'Error deleting submissions' });
  }
});




  app.put('/api/cquestionss/:id', async (req, res) => {
    const questionId = req.params.id;
    
    try {
        const updatedQuestion = await Cquestions.findByIdAndUpdate(questionId, req.body, { new: true });
        
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        res.json({ message: 'Question updated successfully!', question: updatedQuestion });
    } catch (error) {
        res.status(500).json({ message: 'Error updating question', error });
    }
  });
  
  app.get('/api/submissions-and-non-submissions/:week', async (req, res) => {
    const weekNumber = req.params.week;
    const { courseYear, company } = req.query; // Capture courseYear and company from the query
  
    try {
      // Filter users based on courseYear if provided
      const userFilter = courseYear ? { courseYear } : {};
  
      // Fetch all users with specified courseYear, or all users if no filter
      const users = await userModel
        .find(userFilter)
        .select('name email admissionno rollno courseYear')
        .exec();
  
      // Filter submissions by both week and company
      const submissionFilter = { week: weekNumber };
      if (company) {
        submissionFilter.company = company;
      }
  
      // Fetch all submissions matching the week and company, if specified, and populate userId fields
      const submissions = await Submission.find(submissionFilter)
        .populate({
          path: 'userId',
          select: 'email name admissionno rollno courseYear',
          match: userFilter,
        })
        .select('submissionTime score dueDate company') // Include dueDate and other fields
        .exec();
  
      // Filter valid submissions with a populated userId field
      const validSubmissions = submissions.filter(submission => submission.userId);
  
      // Get a list of userIds who have submitted for the specified week and company
      const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));
  
      // Find users who haven’t submitted for the specified company and week
      const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));
  
      // Respond with submissions and non-submitted users
      res.json({
        submissions: validSubmissions,
        nonSubmittedUsers,
      });
    } catch (error) {
      console.error('Error fetching submissions and non-submissions:', error);
      res.status(500).json({ message: 'Error fetching submissions and non-submissions', error: error.message });
    }
  });
    
    


  app.get('/api/mcasubmissions-and-non-submissionscompiler/:week', async (req, res) => {
    const weekNumber = req.params.week;
    const { courseYear, company } = req.query; // Capture courseYear and company from the query
  
    try {
      // Build a user filter to fetch only MCA students.
      const userFilter = { batch: 'MCA' };
      if (courseYear) {
        userFilter.courseYear = courseYear;
      }
  
      // Fetch all users matching the filter (only MCA students)
      const users = await userModel
        .find(userFilter)
        .select('name email admissionno rollno courseYear')
        .exec();
  
      // Build a submission filter based on week and company (if provided)
      const submissionFilter = { week: weekNumber };
      if (company) {
        submissionFilter.company = company;
      }
  
      // Fetch all submissions matching the filter and populate the userId field
      // Only submissions from users matching our MCA filter will be populated.
      const submissions = await CompilerSubmission.find(submissionFilter)
        .populate({
          path: 'userId',
          select: 'email name admissionno rollno courseYear',
          match: userFilter,
        })
        .select('submissionDate score dueDate company passedCount totalTestCases')
        .exec();
  
      // Filter valid submissions where the userId is populated (i.e. MCA students)
      const validSubmissions = submissions.filter(submission => submission.userId);
  
      // Get a set of user IDs who have submitted for the specified week and company
      const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));
  
      // Find users who haven’t submitted for the specified company and week
      const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));
  
      // Respond with submissions and non-submitted users
      res.json({
        submissions: validSubmissions,
        nonSubmittedUsers,
      });
    } catch (error) {
      console.error('Error fetching submissions and non-submissions:', error);
      res.status(500).json({ message: 'Error fetching submissions and non-submissions', error: error.message });
    }
  });
  
  app.get('/api/mbasubmissions-and-non-submissionscompiler/:week', async (req, res) => {
    const weekNumber = req.params.week;
    const { courseYear, company } = req.query; // Capture courseYear and company from the query
  
    try {
      // Build a user filter to fetch only MCA students.
      const userFilter = { batch: 'MBA' };
      if (courseYear) {
        userFilter.courseYear = courseYear;
      }
  
      // Fetch all users matching the filter (only MCA students)
      const users = await userModel
        .find(userFilter)
        .select('name email admissionno rollno courseYear')
        .exec();
  
      // Build a submission filter based on week and company (if provided)
      const submissionFilter = { week: weekNumber };
      if (company) {
        submissionFilter.company = company;
      }
  
      // Fetch all submissions matching the filter and populate the userId field
      // Only submissions from users matching our MCA filter will be populated.
      const submissions = await CompilerSubmission.find(submissionFilter)
        .populate({
          path: 'userId',
          select: 'email name admissionno rollno courseYear',
          match: userFilter,
        })
        .select('submissionDate score dueDate company passedCount totalTestCases')
        .exec();
  
      // Filter valid submissions where the userId is populated (i.e. MCA students)
      const validSubmissions = submissions.filter(submission => submission.userId);
  
      // Get a set of user IDs who have submitted for the specified week and company
      const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));
  
      // Find users who haven’t submitted for the specified company and week
      const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));
  
      // Respond with submissions and non-submitted users
      res.json({
        submissions: validSubmissions,
        nonSubmittedUsers,
      });
    } catch (error) {
      console.error('Error fetching submissions and non-submissions:', error);
      res.status(500).json({ message: 'Error fetching submissions and non-submissions', error: error.message });
    }
  });
  
  app.get('/api/btechsubmissions-and-non-submissionscompiler/:week', async (req, res) => {
    const weekNumber = req.params.week;
    const { courseYear, company } = req.query; // Capture courseYear and company from the query
  
    try {
      // Build a user filter for students whose course is not MCA or MBA
      const userFilter = { batch: { $nin: ['MCA', 'MBA'] } };
      if (courseYear) {
        userFilter.courseYear = courseYear;
      }
  
      // Fetch all users matching the filter (only non‑MCA/MBA students)
      const users = await userModel
        .find(userFilter)
        .select('name email admissionno rollno courseYear')
        .exec();
  
      // Build a submission filter based on week and company (if provided)
      const submissionFilter = { week: weekNumber };
      if (company) {
        submissionFilter.company = company;
      }
  
      // Fetch all submissions matching the filter and populate the userId field,
      // ensuring only users matching our filter are populated.
      const submissions = await CompilerSubmission.find(submissionFilter)
        .populate({
          path: 'userId',
          select: 'email name admissionno rollno courseYear',
          match: userFilter,
        })
        .select('submissionDate score dueDate company passedCount totalTestCases')
        .exec();
  
      // Filter valid submissions where the userId field is populated (i.e. non‑MCA/MBA students)
      const validSubmissions = submissions.filter(submission => submission.userId);
  
      // Build a set of user IDs that have submitted for the given week and company
      const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));
  
      // Find users who haven't submitted for the specified week and company
      const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));
  
      // Respond with both valid submissions and the list of non‑submitted users
      res.json({
        submissions: validSubmissions,
        nonSubmittedUsers,
      });
    } catch (error) {
      console.error('Error fetching submissions and non-submissions:', error);
      res.status(500).json({ message: 'Error fetching submissions and non-submissions', error: error.message });
    }
  });

  app.get('/api/mbascoress/:startWeek/:endWeek', async (req, res) => {
    const { startWeek, endWeek } = req.params;
  
    try {
      // Fetch submissions within the specified week range and join with users
      const submissions = await CompilerSubmission.aggregate([
        {
          $match: {
            week: { $gte: parseInt(startWeek), $lte: parseInt(endWeek) },
          },
        },
        {
          $lookup: {
            from: 'users', // Name of the users collection
            localField: 'userId', // Field from CompilerSubmission
            foreignField: '_id', // Field from users collection
            as: 'userDetails', // Output array field
          },
        },
        {
          $unwind: '$userDetails', // Unwind to flatten the userDetails array
        },
        {
          $match: {
            'userDetails.batch': { $regex: /MBA/i }, // Case-insensitive match for MCA students
          },
        },
        {
          $group: {
            _id: "$userId", // Group by user ID
            totalScore: { $sum: "$passedCount" }, // Sum passedCount for total score
            userDetails: { $first: "$userDetails" }, // Get user details from the first submission
          },
        },
        {
          $sort: { totalScore: -1 }, // Sort by total score descending
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: "$userDetails.name",
            admissionNo: "$userDetails.admissionno",
            rollNo: "$userDetails.rollno",
            courseYear: "$userDetails.courseYear",
            email: "$userDetails.email",
            score: "$totalScore",
          },
        },
      ]);
  
      // Return the result
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching scores:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  app.get('/api/scoress/:startWeek/:endWeek', async (req, res) => {
    const { startWeek, endWeek } = req.params;
  
    try {
      // Fetch submissions within the specified week range and join with users
      const submissions = await CompilerSubmission.aggregate([
        {
          $match: {
            week: { $gte: parseInt(startWeek), $lte: parseInt(endWeek) },
          },
        },
        {
          $lookup: {
            from: 'users', // Name of the users collection
            localField: 'userId', // Field from CompilerSubmission
            foreignField: '_id', // Field from users collection
            as: 'userDetails', // Output array field
          },
        },
        {
          $unwind: '$userDetails', // Unwind to flatten the userDetails array
        },
        {
          $match: {
            'userDetails.batch': { $regex: /MCA/i }, // Case-insensitive match for MCA students
          },
        },
        {
          $group: {
            _id: "$userId", // Group by user ID
            totalScore: { $sum: "$passedCount" }, // Sum passedCount for total score
            userDetails: { $first: "$userDetails" }, // Get user details from the first submission
          },
        },
        {
          $sort: { totalScore: -1 }, // Sort by total score descending
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: "$userDetails.name",
            admissionNo: "$userDetails.admissionno",
            rollNo: "$userDetails.rollno",
            courseYear: "$userDetails.courseYear",
            email: "$userDetails.email",
            score: "$totalScore",
          },
        },
      ]);
  
      // Return the result
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching scores:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  



  app.get('/api/btechscoresss/:startWeek/:endWeek', async (req, res) => {
    const { startWeek, endWeek } = req.params;
  
    try {
      // Fetch submissions within the specified week range and join with users
      const submissions = await CompilerSubmission.aggregate([
        {
          $match: {
            week: { $gte: parseInt(startWeek), $lte: parseInt(endWeek) },
          },
        },
        {
          $lookup: {
            from: 'users', // Name of the users collection
            localField: 'userId', // Field from CompilerSubmission
            foreignField: '_id', // Field from users collection
            as: 'userDetails', // Output array field
          },
        },
        {
          $unwind: '$userDetails', // Unwind to flatten the userDetails array
        },
        {
          $match: {
            'userDetails.batch': { 
              $not: { $regex: /(MCA|MBA)/i } // Exclude MCA and MBA (case-insensitive)
            }
          },
        },
        {
          $group: {
            _id: "$userId", // Group by user ID
            totalScore: { $sum: "$passedCount" }, // Sum passedCount for total score
            userDetails: { $first: "$userDetails" }, // Get user details from the first submission
          },
        },
        {
          $sort: { totalScore: -1 }, // Sort by total score descending
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: "$userDetails.name",
            admissionNo: "$userDetails.admissionno",
            rollNo: "$userDetails.rollno",
            courseYear: "$userDetails.courseYear",
            email: "$userDetails.email",
            score: "$totalScore",
          },
        },
      ]);
  
      // Return the result
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching scores:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
// Export the router to use in your main app
// Add this endpoint in your router file
// Add this endpoint in your router file
app.get('/api/week-rangess', async (req, res) => {
  try {
    // Fetch distinct weeks from CompilerSubmission
    const weeks = await CompilerSubmission.distinct('week'); // Get distinct weeks

    // Sort the weeks to ensure they are in the correct order
    weeks.sort((a, b) => a - b);

    const weekRanges = [];

    // Use a fixed range approach to avoid gaps in ranges
    for (let i = 1; i <= Math.max(...weeks); i += 4) {
      const start = i;
      const end = i + 3;

      // Add range to weekRanges array
      weekRanges.push(`Week ${start}-${end}`);
    }

    res.json(weekRanges); // Send the calculated ranges to the frontend
  } catch (error) {
    console.error('Error fetching week ranges:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});  

    
app.get('/api/submissions-and-non-submissionscompiler/:week', async (req, res) => {
  const weekNumber = req.params.week;
  const { courseYear, company } = req.query; // Capture courseYear and company from the query

  try {
      // Filter users based on courseYear and ensure they are MCA students
      const userFilter = { course: 'MCA' };
      if (courseYear) {
          userFilter.courseYear = courseYear;
      }

      // Fetch all MCA students with specified courseYear, or all MCA students if no filter
      const users = await userModel
          .find(userFilter)
          .select('name email admissionno rollno courseYear')
          .exec();

      // Filter submissions by both week and company
      const submissionFilter = { week: weekNumber };
      if (company) {
          submissionFilter.company = company;
      }

      // Fetch all submissions matching the week and company, ensuring only MCA students are included
      const submissions = await CompilerSubmission.find(submissionFilter)
          .populate({
              path: 'userId',
              select: 'email name admissionno rollno courseYear',
              match: userFilter, // Ensures only MCA students are included
          })
          .select('submissionDate score dueDate company passedCount totalTestCases')
          .exec();

      // Filter valid submissions with a populated userId field
      const validSubmissions = submissions.filter(sub => sub.userId);

      // Get a list of userIds who have submitted for the specified week and company
      const submittedUserIds = new Set(validSubmissions.map(sub => sub.userId._id.toString()));

      // Find MCA students who haven’t submitted for the specified company and week
      const nonSubmittedUsers = users.filter(user => !submittedUserIds.has(user._id.toString()));

      // Respond with submissions and non-submitted users
      res.json({
          submissions: validSubmissions,
          nonSubmittedUsers,
      });
  } catch (error) {
      console.error('Error fetching submissions and non-submissions:', error);
      res.status(500).json({ message: 'Error fetching submissions and non-submissions', error: error.message });
  }
});


const AttendanceSchema = new mongoose.Schema({
  userId: String,
  roomid: String,
  joinTime: Date,
  leaveTime: Date
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);



// Store Join Time
app.post('/api/trackAttendance', async (req, res) => {
  const { userId, roomid, joinTime } = req.body;
  await Attendance.create({ userId, roomid, joinTime });
  res.send({ message: "Attendance started" });
});

// Store Leave Time
app.put('/api/trackAttendance', async (req, res) => {
  const { userId, roomid, leaveTime } = req.body;
  await Attendance.findOneAndUpdate({ userId, roomid }, { leaveTime });
  res.send({ message: "Attendance updated" });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
