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
  const [emotion, setEmotion] = useState("No Emotion Detected"); // ✅ Store detected emotion
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

  const loadFaceApiModels = async () => {
    try {
      console.log("🔄 Loading Face-api.js models...");
      
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models"); // ✅ Loads tiny_face_detector
      await faceapi.nets.faceExpressionNet.loadFromUri("/models"); // ✅ Loads face_expression
      
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

  const readQuestionAloud = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  const captureImageAndDetectEmotion = async () => {
    if (!webcamRef.current) return;
  
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  
    const video = webcamRef.current.video;
    if (!video) return;
  
    // ✅ Ensure models are loaded before running detection
    if (!faceapi.nets.tinyFaceDetector.isLoaded || !faceapi.nets.faceExpressionNet.isLoaded) {
      console.error("❌ Models are not loaded yet! Waiting...");
      return;
    }
  
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
    console.log(faceapi.nets.tinyFaceDetector.isLoaded, faceapi.nets.faceExpressionNet.isLoaded);

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
      ) : interview ? (
        <>
          {interview.questions.length > 0 ? (
            <>
              <h3>Question {currentQuestionIndex + 1}:</h3>
              <p>{interview.questions[currentQuestionIndex]?.question}</p>

              <button onClick={() => readQuestionAloud(interview.questions[currentQuestionIndex]?.question)}>
                Read Question
              </button>

              {/* ✅ Webcam Preview */}
              <div style={{ marginTop: "20px" }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={250}
                />
                <button onClick={captureImageAndDetectEmotion}>Capture & Detect Emotion</button>
              </div>

              {/* ✅ Show Captured Image & Detected Emotion */}
              {capturedImage && (
                <div>
                  <h4>Captured Image:</h4>
                  <img src={capturedImage} alt="Captured" width={250} />
                  <h4>Detected Emotion: {emotion}</h4>
                </div>
              )}

              <div>
                <h4>Your Answer:</h4>
                <p>{userAnswers[currentQuestionIndex] || "No answer recorded yet"}</p>

                <button onClick={() => SpeechRecognition.startListening({ continuous: false })} disabled={listening}>
                  {listening ? "Listening..." : "Start Recording"}
                </button>

                <button onClick={SpeechRecognition.stopListening} disabled={!listening}>
                  Stop Recording
                </button>

                <button onClick={resetTranscript}>Reset Answer</button>
              </div>

              <button onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))} disabled={currentQuestionIndex === 0}>
                Previous
              </button>

              <button onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, interview.questions.length - 1))}>
                Next
              </button>
            </>
          ) : (
            <p>No questions found.</p>
          )}
        </>
      ) : (
        <p>Loading interview details...</p>
      )}
    </div>
  );
}

export default ViewQuestions;
