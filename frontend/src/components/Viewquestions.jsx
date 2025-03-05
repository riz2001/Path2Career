import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js"; // ✅ Import Face-api.js

function ViewQuestions() {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [overallRating, setOverallRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [emotion, setEmotion] = useState("No Emotion Detected");
  const [timer, setTimer] = useState(180); // ✅ 3-minute timer per question
  const [totalTimeTaken, setTotalTimeTaken] = useState(0); // ✅ Track total time
  const webcamRef = useRef(null);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    loadFaceApiModels();
    fetchInterview();
  }, []);

  useEffect(() => {
    if (!listening && transcript) {
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: transcript,
      }));
      resetTranscript();
    }
  }, [transcript, listening, currentQuestionIndex]);

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

  useEffect(() => {
    if (questionsGenerated) {
      const totalTimeInterval = setInterval(() => {
        setTotalTimeTaken((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(totalTimeInterval);
    }
  }, [questionsGenerated]);

  const loadFaceApiModels = async () => {
    try {
      console.log("🔄 Loading Face-api.js models...");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      console.log("✅ Face-api.js models loaded successfully.");
    } catch (error) {
      console.error("❌ Error loading Face-api.js models:", error);
    }
  };

  const fetchInterview = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/interviews/${interviewId}`);
      setInterview(response.data);
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetTranscript();
    } else {
      submitAnswers();
    }
  };

  const captureImageAndDetectEmotion = async () => {
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
    } else {
      setEmotion("No Emotion Detected");
    }
  };

  const submitAnswers = async () => {
    setLoading(true);
    setSubmitted(true);

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
      const checkSubmission = await axios.get(`http://localhost:5000/api/check-submission/${interviewId}/${userId}`);
      if (checkSubmission.data.alreadySubmitted) {
        alert("You have already submitted this interview!");
        setLoading(false);
        return;
      }

      const feedbackResponse = await axios.post("http://localhost:5000/api/generate-overall-feedback", {
        interviewId,
        answers: formattedAnswers,
      });

      const { feedback, overallRating } = feedbackResponse.data;

      await axios.post("http://localhost:5000/api/submit-interview", {
        interviewId,
        userId,
        jobPosition: interview.jobPosition,
        experienceRequired: interview.jobExperience,
        answers: formattedAnswers,
        overallRating,
        feedback,
        emotionDetected: emotion,
        totalTimeTaken,
      });

      setFeedback(feedback);
      setOverallRating(overallRating);
    } catch (error) {
      console.error("❌ Error generating feedback or saving submission:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      {!questionsGenerated ? (
        <>
          <h2>{interview ? `${interview.jobPosition} Interview` : "Loading Interview..."}</h2>
          <p><strong>Description:</strong> {interview ? interview.jobDesc : "Loading..."}</p>
          <p><strong>Experience Required:</strong> {interview ? `${interview.jobExperience} Years` : "Loading..."}</p>

          <button onClick={generateQuestions} disabled={loading}>
            {loading ? "Generating..." : "Start Interview"}
          </button>
        </>
      ) : !submitted ? (
        <>
          <h3>Question {currentQuestionIndex + 1}:</h3>
          <p>{interview.questions[currentQuestionIndex]?.question}</p>
          <h4>Time Left: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60} ⏳</h4>

          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={250} />
          <button onClick={captureImageAndDetectEmotion}>Capture & Detect Emotion</button>
          <h4>Detected Emotion: {emotion}</h4>

          <button onClick={() => SpeechRecognition.startListening({ continuous: false })} disabled={listening}>
            {listening ? "Listening..." : "Start Recording"}
          </button>
          <button onClick={SpeechRecognition.stopListening} disabled={!listening}>Stop Recording</button>

          <button onClick={handleNextQuestion}>
            {currentQuestionIndex === interview.questions.length - 1 ? "Submit & Get Feedback" : "Next"}
          </button>
        </>
      ) : (
        <>
          <h2>Overall Feedback & Rating</h2>
          {Object.entries(feedback).map(([index, fb]) => (
            <div key={index}>
              <h4>Question {parseInt(index) + 1}:</h4>
              <p>{fb}</p>
            </div>
          ))}
          <h3>Final Rating: {overallRating}/10</h3>
          <h3>Total Time Taken: {Math.floor(totalTimeTaken / 60)} minutes {totalTimeTaken % 60} seconds</h3>
        </>
      )}
    </div>
  );
}

export default ViewQuestions;
