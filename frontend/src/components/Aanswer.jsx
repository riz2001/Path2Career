// src/components/Aanswer.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Adminnavbar from './Adminnavbar';



const Aanswer = () => {
  const [week, setWeek] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [company, setCompany] = useState(''); // New state for company
  const [companies, setCompanies] = useState([]); // State to store companies

  const fetchAvailableWeeks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/available-weekss');
      setWeeks(response.data);
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/companies'); // Fetch companies from API
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchQuestions = async (selectedWeek, selectedCompany) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/filter-questions/${selectedWeek}/${selectedCompany}`);
      console.log('Fetched questions:', response.data);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Error fetching questions.');
    }
  };

  const handleWeekChange = (e) => {
    const selectedWeek = e.target.value;
    setWeek(selectedWeek);
    if (selectedWeek && company) {
      fetchQuestions(selectedWeek, company);
      setSubmitted(false);
    }
  };

  const handleCompanyChange = (e) => {
    const selectedCompany = e.target.value;
    setCompany(selectedCompany);
    if (week && selectedCompany) {
      fetchQuestions(week, selectedCompany);
      setSubmitted(false);
    }
  };

  const handleSubmit = async () => {
    const userAnswers = questions.map(question => ({
      questionId: question._id,
      week: Number(week),
      answer: question.answer,
      explanation: question.explanation,
      submittedAt: new Date(),
      company:question.company,
    }));
  
    try {
      await axios.post('http://localhost:5000/api/submit-answerss', userAnswers);
      alert('Answers submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Error submitting answers.');
    }
  };

  useEffect(() => {
    fetchAvailableWeeks();
    fetchCompanies(); // Fetch companies on component mount
  }, []);

  return (
    <div>
      <Adminnavbar/>
      <div className="answer-container">
        <h2 className="header"><b>SUBMIT SOLUTIONS</b></h2>

        <label htmlFor="companySelect">
          Company:
          <select id="companySelect" value={company} onChange={handleCompanyChange} required>
            <option value="" disabled>Select a company</option>
            {companies.map((company, index) => (
              <option key={index} value={company}>
                {company}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="weekSelect">
          Week:
          <select id="weekSelect" value={week} onChange={handleWeekChange} required>
            <option value="" disabled>Select a week</option>
            {weeks.map((availableWeek, index) => (
              <option key={index} value={availableWeek}>
                Week {availableWeek}
              </option>
            ))}
          </select>
        </label>

        <button className="submit-button" onClick={handleSubmit} disabled={!week || !company || submitted}>
          Submit Answers
        </button>

        <div className="questions-container">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div key={question._id} className="question-card">
                <h3>Question {index + 1}: {question.question}</h3>
                <div>
                  <strong>Correct Answer:</strong> {question.answer}
                </div>
                {question.explanation && (
                  <div>
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No questions found for this week and company.</p>
          )}
        </div>

        <style jsx>{`
          .answer-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          }

          .header {
            text-align: center;
            color: #4CAF50;
            margin-bottom: 20px;
            font-size: 28px;
          }

          label {
            font-weight: bold;
            margin-right: 10px;
          }

          select {
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 16px;
          }

          .submit-button {
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-bottom: 20px;
          }

          .submit-button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }

          .questions-container {
            margin-top: 20px;
          }

          .question-card {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
          }

          h3 {
            margin-bottom: 10px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Aanswer;
