import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js"; // Import Face-api.js
import Usernavbar1 from "./Usernavbar1";

function ViewQuestions() {
  const { interviewId } = useParams();

  // Interview and submission state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [overallRating, setOverallRating] = useState(null);
  const [dueDate, setDueDate] = useState("");

  // Face detection state
  const [capturedImage, setCapturedImage] = useState(null);
  const [emotion, setEmotion] = useState("No Emotion Detected");
  const [faceScores, setFaceScores] = useState([]); // Scores captured for current question
  const [allFaceScores, setAllFaceScores] = useState([]); // Array of average face scores per question

  // Timer state
  const [timer, setTimer] = useState(180); // 3 minutes per question
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [interviewStartTime, setInterviewStartTime] = useState(null);

  // Refs and speech recognition
  const webcamRef = useRef(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    loadFaceApiModels();
    fetchInterview();
  }, []);

  // Set interview start time once questions are generated
  useEffect(() => {
    if (questionsGenerated && !interviewStartTime) {
      setInterviewStartTime(Date.now());
    }
  }, [questionsGenerated, interviewStartTime]);

  // Automatically read the current question aloud when it appears
  useEffect(() => {
    if (questionsGenerated && interview && interview.questions[currentQuestionIndex]) {
      readQuestionAloud(interview.questions[currentQuestionIndex].question);
    }
  }, [currentQuestionIndex, questionsGenerated, interview]);

  // Update user answer from voice transcript
  useEffect(() => {
    if (!listening && transcript) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: transcript,
      }));
      resetTranscript();
    }
  }, [transcript, listening, currentQuestionIndex]);

  // Timer for each question
  useEffect(() => {
    if (!submitted && questionsGenerated) {
      setTimer(180);
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            handleNextQuestion();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [currentQuestionIndex, questionsGenerated, submitted]);

  // Total time tracking effect
  useEffect(() => {
    if (questionsGenerated) {
      const totalTimeInterval = setInterval(() => {
        setTotalTimeTaken((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(totalTimeInterval);
    }
  }, [questionsGenerated]);

  // Auto-capture face images 3 times per question at 5-second intervals
  useEffect(() => {
    if (questionsGenerated && !submitted) {
      setFaceScores([]); // Reset for new question
      let captureCount = 0;
      const autoCapture = setInterval(async () => {
        if (captureCount < 3) {
          await captureFaceScore();
          captureCount++;
        } else {
          clearInterval(autoCapture);
        }
      }, 5000);
      return () => clearInterval(autoCapture);
    }
  }, [currentQuestionIndex, questionsGenerated, submitted]);

  // Compute average face score for current question when 3 captures are done
  useEffect(() => {
    if (faceScores.length === 3) {
      const avg = (faceScores.reduce((a, b) => a + b, 0) / faceScores.length).toFixed(2);
      setAllFaceScores((prev) => [...prev, Number(avg)]);
    }
  }, [faceScores]);

  const loadFaceApiModels = async () => {
    try {
      console.log("Loading Face-api.js models...");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      console.log("Face-api.js models loaded successfully.");
    } catch (error) {
      console.error("Error loading Face-api.js models:", error);
    }
  };

  const fetchInterview = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/interviews/${interviewId}`);
      setInterview(response.data);
      setDueDate(response.data.dueDate);
    } catch (error) {
      console.error("Error fetching interview:", error);
    }
  };

  const generateQuestions = async () => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/generate-questions/${interviewId}`);
      alert("Questions generated successfully!");
      setQuestionsGenerated(true);
      fetchInterview();
    } catch (error) {
      console.error("Error generating questions:", error);
    }
    setLoading(false);
  };

  const captureFaceScore = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    const video = webcamRef.current.video;
    if (!video) return;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    if (detection) {
      const maxEmotion = Object.keys(detection.expressions).reduce((a, b) =>
        detection.expressions[a] > detection.expressions[b] ? a : b
      );
      setEmotion(maxEmotion);
      const score = calculateEmotionScore(maxEmotion);
      setFaceScores((prev) => [...prev, score]);
    } else {
      setEmotion("No Emotion Detected");
      setFaceScores((prev) => [...prev, 0]);
    }
  };

  const calculateEmotionScore = (emotion) => {
    const scores = {
      happy: 10,
      neutral: 7,
      surprised: 8,
      sad: 4,
      angry: 3,
      fearful: 5,
      disgusted: 2,
    };
    return scores[emotion] || 0;
  };

  // Helper function to read question text aloud
  const readQuestionAloud = (text) => {
    if ("speechSynthesis" in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNextQuestion = () => {
    if (faceScores.length > 0 && faceScores.length < 3) {
      const remaining = 3 - faceScores.length;
      const filled = Array(remaining).fill(0);
      const avg = ((faceScores.concat(filled)).reduce((a, b) => a + b, 0) / 3).toFixed(2);
      setAllFaceScores((prev) => [...prev, Number(avg)]);
    } else if (faceScores.length === 3) {
      const avg = (faceScores.reduce((a, b) => a + b, 0) / faceScores.length).toFixed(2);
      setAllFaceScores((prev) => [...prev, Number(avg)]);
    } else {
      setAllFaceScores((prev) => [...prev, 0]);
    }
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetTranscript();
      setFaceScores([]);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    setLoading(true);
    setSubmitted(true);
    const finalTotalTime = Math.floor((Date.now() - interviewStartTime) / 1000);
    setTotalTimeTaken(finalTotalTime);

    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("User not logged in! Please log in again.");
      setLoading(false);
      return;
    }
    const formattedAnswers = interview.questions.map((q, index) => ({
      question: q.question,
      userAnswer: userAnswers[index] || "No answer given",
    }));

    try {
      const feedbackResponse = await axios.post("http://localhost:5000/api/generate-overall-feedback", {
        interviewId,
        answers: formattedAnswers,
      });
      const { feedback, overallRating } = feedbackResponse.data;

      // Calculate overall average face score across all questions
      const overallFaceScore =
        allFaceScores.length > 0
          ? parseFloat((allFaceScores.reduce((a, b) => a + b, 0) / allFaceScores.length).toFixed(2))
          : 0;
      // Calculate combined average (average of overallRating and overallFaceScore)
      const combinedAverage =
        overallRating !== null
          ? parseFloat(((parseFloat(overallRating) + overallFaceScore) / 2).toFixed(2))
          : 0;

      await axios.post("http://localhost:5000/api/submit-interview", {
        interviewId,
        userId,
        jobPosition: interview.jobPosition,
        experienceRequired: interview.jobExperience,
        answers: formattedAnswers,
        dueDate: interview.dueDate,
        overallRating,
        feedback,
        week:interview.week,
        emotionDetected: {
          perQuestionAverages: allFaceScores,
          overallAverage: overallFaceScore,
        },
        combinedAverage,
        totalTimeTaken: finalTotalTime,
      });

      setFeedback(feedback);
      setOverallRating(overallRating);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.includes("already submitted")
      ) {
        setAlreadySubmitted(true);
        alert("You have already submitted this interview!");
      } else {
        console.error("Error generating feedback or saving submission:", error);
        alert("Error submitting interview. Please try again.");
      }
    }
    setLoading(false);
  };

  const overallFaceScoreComputed =
    allFaceScores.length > 0
      ? parseFloat((allFaceScores.reduce((a, b) => a + b, 0) / allFaceScores.length).toFixed(2))
      : 0;
  const combinedAverageDisplay =
    overallRating !== null
      ? parseFloat(((parseFloat(overallRating) + overallFaceScoreComputed) / 2).toFixed(2))
      : "N/A";

  if (alreadySubmitted) {
    return (
      <div className="interview-container">
        <Usernavbar1 />
        <h2>You have already submitted this interview!</h2>
      </div>
    );
  }

  return (
    <div>
    <Usernavbar1 />
    <div className="interview-container">
  
      {!questionsGenerated ? (
        <div className="intro-card">
          <h2 className="title">
            {interview ? `${interview.jobPosition} Interview` : "Loading Interview..."}
          </h2>
          <p className="description">
            <strong>Description:</strong> {interview?.jobDesc || "Loading..."}
          </p>
          <p className="experience">
            <strong>Experience Required:</strong> {interview?.jobExperience} Years
          </p>
          <p className="due-date">
            <strong>DUE DATE:</strong>{" "}
            {interview?.dueDate ? new Date(interview.dueDate).toLocaleDateString() : "Loading..."}
          </p>
          <button className="start-btn" onClick={generateQuestions} disabled={loading}>
            {loading ? "Generating..." : "Start Interview"}
          </button>
        </div>
      ) : !submitted ? (
        <div className="question-card">
          <h3 className="question-number">Question {currentQuestionIndex + 1}</h3>
          <p className="question-text">{interview.questions[currentQuestionIndex]?.question}</p>
          <h4 className="timer">
            Time Left: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60} ⏳
          </h4>
          <div className="webcam-container">
            <Webcam className="webcam" audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          </div>
          <div className="face-scores">
            {faceScores.length > 0 && (
              <>
                <p>Individual Face Scores: {faceScores.join(", ")}</p>
                {faceScores.length === 3 && (
                  <p>
                    Average Face Score for this question:{" "}
                    {(faceScores.reduce((a, b) => a + b, 0) / faceScores.length).toFixed(2)}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="voice-controls">
            <button className="voice-btn" onClick={() => SpeechRecognition.startListening({ continuous: true })} disabled={listening}>
              {listening ? "Listening..." : "Start Recording"}
            </button>
            <button className="voice-btn" onClick={SpeechRecognition.stopListening} disabled={!listening}>
              Stop Recording
            </button>
          </div>
          <div className="recorded-answer">
            <h4>Your Answer:</h4>
            <p>{userAnswers[currentQuestionIndex] || "No answer recorded yet"}</p>
          </div>
          <button className="next-btn" onClick={handleNextQuestion}>
            {currentQuestionIndex === interview.questions.length - 1 ? "Submit & Get Feedback" : "Next"}
          </button>
        </div>
      ) : (
        <div className="feedback-card">
          <h2 className="feedback-title">Overall Feedback & Rating</h2>
          <h3 className="time-taken">
            Total Time Taken: {Math.floor(totalTimeTaken / 60)} minutes {totalTimeTaken % 60} seconds
          </h3>
          {Object.entries(feedback).map(([index, fb]) => (
            <div key={index} className="feedback-item">
              <h4>Question {parseInt(index) + 1}:</h4>
              <p>{fb}</p>
            </div>
          ))}
          <h3 className="final-rating">Final Rating: {overallRating}/10</h3>
          <h3 className="final-face-score">Overall Average Face Score: {overallFaceScoreComputed}</h3>
          <h3 className="combined-average">Combined Average (Rating & Face Score): {combinedAverageDisplay}</h3>
        </div>
      )}

      <style jsx>{`
        .interview-container {
          width: 90%;
          max-width: 1000px;
          margin: 30px auto;
          padding: 20px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-family: "Poppins", sans-serif;
        }
        .intro-card, .question-card, .feedback-card {
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .title, .question-number, .feedback-title {
          color: #333;
          margin-bottom: 15px;
        }
        .description, .experience, .question-text, .due-date {
          font-size: 18px;
          color: #555;
          margin-bottom: 10px;
        }
        .timer {
          font-size: 20px;
          color: #e63946;
          margin-bottom: 15px;
        }
        .webcam-container {
          margin: 15px 0;
        }
        .webcam {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .capture-btn, .start-btn, .next-btn, .voice-btn {
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 5px;
          padding: 10px 20px;
          cursor: pointer;
          margin: 10px 5px;
          font-size: 16px;
        }
        .capture-btn:hover, .start-btn:hover, .next-btn:hover, .voice-btn:hover {
          background-color: #0056b3;
        }
        .recorded-answer {
          background: #f1f1f1;
          padding: 10px;
          border-radius: 5px;
          margin: 15px 0;
          color: #333;
          font-size: 18px;
        }
        .feedback-item {
          background: #f8f8f8;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 10px;
          text-align: left;
        }
        .feedback-item h4 {
          margin-bottom: 5px;
          font-size: 20px;
          color: #444;
        }
        .feedback-item p {
          font-size: 18px;
          color: #555;
        }
        .final-rating, .time-taken, .final-face-score, .combined-average {
          font-size: 24px;
          color: #333;
          margin-bottom: 15px;
        }
        .face-scores {
          margin: 10px 0;
          font-size: 16px;
          color: #333;
        }
      `}</style>
    </div>
    </div>
  );
}

export default ViewQuestions;
