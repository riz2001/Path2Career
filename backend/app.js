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
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jobModel = require("./models/job");

// Initialize Express App
const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all origins

// MongoDB Connection
const mongoURI = "mongodb+srv://rizwan2001:rizwan2001@cluster0.6ucejfl.mongodb.net/mock?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));



// Set your Gemini API key directly in the code
const GEMINI_API_KEY = "AIzaSyB1cE9da4QfoAUyRZat367HLOGTqYtZWa0"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// **📌 Route to Generate AI Content**
app.post("/api/create-interview", async (req, res) => {
  try {
    const { jobPosition, jobDesc, jobExperience } = req.body;
    const interview = new Interview({ jobPosition, jobDesc, jobExperience, questions: [] });
    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **📌 Get All Interviews**
app.get("/api/interviews", async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interviews" });
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

// Route to approve a user by ID
app.put("/approve/:id", async (req, res) => {
  try {
      await userModel.findByIdAndUpdate(req.params.id, { approved: true });
      res.json({ message: "User approved successfully" });
  } catch (error) {
      res.json({ status: "error", message: error.message });
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

  
  
  // Route to handle quiz submission and evaluate answers
  app.post('/api/submit-quiz', async (req, res) => {
    const { week, answers, dueDate,company} = req.body; // Include dueDate in the request
  
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
        dueDate: dueDate, // Save the due date
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
        const questions = await Question.find({ company: company, week });
        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this company and week.' });
        }
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
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

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
