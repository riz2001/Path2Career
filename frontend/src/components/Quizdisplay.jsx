import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const QuizComponent = () => {
  const { company, week } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]); // We'll build this array as we go
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(true);

  // States for submission feedback
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [results, setResults] = useState([]);

  // Fetch questions from API endpoint
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/company/${company}/week/${week}`);
        setQuestions(res.data);
        // Initialize answers array as empty; we push answers as user proceeds.
        setAnswers([]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [company, week]);

  // Timer effect for each question (skip if already submitted)
  useEffect(() => {
    if (submitted || alreadySubmitted) return;
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // When timer reaches 0, record answer (blank if none selected) and move on
      handleNext();
    }
  }, [timer, submitted, alreadySubmitted]);

  // Record the selected answer for the current question
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  // Handle moving to the next question or submitting when on the last question
  const handleNext = () => {
    const currentQuestionId = questions[currentQuestionIndex]._id;
    // Create an answer object for the current question
    const answerObj = { questionId: currentQuestionId, answer: selectedAnswer || '' };

    // Append the current answer to the answers array
    setAnswers(prev => [...prev, answerObj]);

    if (currentQuestionIndex + 1 < questions.length) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimer(30); // Reset timer for the next question
    } else {
      // Last question – use a timeout to ensure state updates propagate before submission
      setTimeout(() => {
        // Construct final answers array by appending the current answer (if not already included)
        const finalAnswers = [...answers, answerObj];
        handleSubmit(finalAnswers);
      }, 0);
    }
  };

  // Submit quiz answers to the API
  const handleSubmit = async (finalAnswers) => {
    try {
      const userToken = sessionStorage.getItem('token');
      if (!userToken) {
        alert('User not authenticated');
        return;
      }
      const res = await axios.post('http://localhost:5000/api/submit-quiz', {
        week,
        answers: finalAnswers,
        dueDate: new Date(),
        company,
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setScore(res.data.score);
      setResults(res.data.results);
      setSubmitted(true);
      // Optionally, navigate away after submission:
      // navigate('/dashboard');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // The API indicates that the user has already submitted the quiz.
        alert(error.response.data.message);
        setAlreadySubmitted(true);
      } else {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz');
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  // Display feedback if the quiz is submitted or if the user has already submitted before
  if (submitted || alreadySubmitted) {
    return (
      <div className="quiz-container">
        {/* Inline styles for feedback display */}
        <style>{`
          .quiz-container {
            width: 80%;
            max-width: 1000px;
            margin: 20px auto;
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .quiz-title {
            text-align: center;
            margin-bottom: 20px;
            font-size: 24px;
            color: #333;
          }
          .results-container {
            margin-top: 20px;
          }
          .results-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            text-align: center;
          }
          .results-list {
            list-style-type: none;
            padding: 0;
          }
          .result-item {
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
          }
          .result-item.correct {
            background-color: #d4edda;
            color: #155724;
          }
          .result-item.incorrect {
            background-color: #f8d7da;
            color: #721c24;
          }
          .result-question, .result-answer, .result-correct, .result-status {
            margin-bottom: 8px;
          }
        `}</style>
        <h2 className="quiz-title">Quiz Feedback</h2>
        {alreadySubmitted && !submitted && (
          <p style={{ textAlign: 'center', color: 'red' }}>
            You have already submitted the quiz for this week.
          </p>
        )}
        <div className="results-container">
          <h3 className="results-title">Your Score: {score}</h3>
          <ul className="results-list">
            {results.map((result, index) => (
              <li key={index} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-question">
                  {questions.find(q => q._id === result.questionId)?.question}
                </div>
                <div className="result-answer">
                  <strong>Your Answer:</strong> {result.userAnswer || 'No answer selected'}
                </div>
                <div className="result-correct">
                  <strong>Correct Answer:</strong> {result.correctAnswer}
                </div>
                <div className="result-status">
                  Status: {result.isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Render quiz interface if not submitted
  return (
    <div className="quiz-container">
      {/* Inline Styles matching your original design */}
      <style>{`
        .quiz-container {
          width: 80%;
          max-width: 1000px;
          margin: 20px auto;
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .quiz-title {
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          color: #333;
        }
        .option-button {
          padding: 10px 20px;
          font-size: 16px;
          color: #fff;
          background-color: #007bff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin: 5px 0;
          width: 100%;
          text-align: left;
        }
        .option-button:hover {
          background-color: #0056b3;
        }
        .selected-option {
          background-color: #0056b3;
          color: #fff;
        }
        .progress-bar {
          height: 10px;
          background-color: #007bff;
        }
      `}</style>
      <h2 className="quiz-title">
        Question {currentQuestionIndex + 1} of {questions.length}
      </h2>
      <p>{questions[currentQuestionIndex]?.question}</p>
      <div>
        {questions[currentQuestionIndex]?.options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${selectedAnswer === option ? 'selected-option' : ''}`}
            onClick={() => handleAnswerSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <div className="progress-bar" style={{ width: `${(timer / 30) * 100}%` }}></div>
        <p>Time left: {timer}s</p>
      </div>
      <button
        onClick={handleNext}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          color: '#fff',
          backgroundColor: '#28a745',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {currentQuestionIndex + 1 < questions.length ? 'Next' : 'Submit'}
      </button>
    </div>
  );
};

export default QuizComponent;
