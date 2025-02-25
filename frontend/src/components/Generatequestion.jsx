import React, { useEffect, useState } from "react";
import axios from "axios";

const InterviewPage = () => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false); // Control UI state

  const recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    : null;

  const startInterview = async () => {
    setInterviewStarted(true);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/generate-questions/123"); // Replace with actual interview ID
      setInterview(response.data);
      setUserAnswers({});
      setCurrentIndex(0);
      setSubmitted(false);
    } catch (error) {
      console.error("Error generating questions:", error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (interview && interview.questions.length > 0) {
      readQuestionAloud(interview.questions[currentIndex]?.question);
    }
  }, [currentIndex, interview]);

  const readQuestionAloud = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech is not supported in this browser.");
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
      recognition.onresult = (event) => {
        setUserAnswers((prev) => ({
          ...prev,
          [currentIndex]: event.results[0][0].transcript,
        }));
      };
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const submitAnswers = async () => {
    setLoading(true);
    setSubmitted(true);

    const formattedAnswers = interview.questions.map((q, index) => ({
      question: q.question,
      userAnswer: userAnswers[index] || "No answer given",
    }));

    try {
      const response = await axios.post("http://localhost:5000/api/generate-overall-feedback", {
        answers: formattedAnswers,
      });

      setFeedback(response.data.feedback);
    } catch (error) {
      console.error("Error generating feedback:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      {!interviewStarted ? (
        <div>
          <h2>Welcome to the AI Interview</h2>
          <button onClick={startInterview} disabled={loading}>
            {loading ? "Generating Questions..." : "Start Interview"}
          </button>
        </div>
      ) : interview ? (
        <>
          <h2>{interview.jobPosition} Interview</h2>
          <p><strong>Description:</strong> {interview.jobDesc}</p>
          <p><strong>Experience Required:</strong> {interview.jobExperience} years</p>

          {interview.questions.length > 0 ? (
            <>
              {!submitted ? (
                <>
                  <h3>Question {currentIndex + 1}:</h3>
                  <p>{interview.questions[currentIndex]?.question}</p>

                  <button onClick={() => readQuestionAloud(interview.questions[currentIndex]?.question)}>
                    Read Question
                  </button>

                  <h4>Your Answer:</h4>
                  <p>{userAnswers[currentIndex] || "No answer recorded yet"}</p>

                  <button onClick={startListening}>Start Recording</button>

                  <div>
                    <button 
                      onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                      disabled={currentIndex === 0}
                    >
                      Previous
                    </button>

                    {currentIndex === interview.questions.length - 1 ? (
                      <button onClick={submitAnswers} disabled={loading}>
                        {loading ? "Submitting..." : "Submit Answers"}
                      </button>
                    ) : (
                      <button 
                        onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, interview.questions.length - 1))}
                      >
                        Next
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2>Feedback & Rating</h2>
                  {Object.entries(feedback).map(([index, fb]) => (
                    <div key={index}>
                      <h4>Question {parseInt(index) + 1}:</h4>
                      <p>{fb}</p>
                    </div>
                  ))}
                </>
              )}
            </>
          ) : (
            <p>No questions found.</p>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default InterviewPage;
