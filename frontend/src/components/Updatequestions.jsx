import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Adminnavbar from './Adminnavbar';



const UpdateQuestions = () => {
  const [week, setWeek] = useState('');
  const [company, setCompany] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);

  // Fetch available weeks and companies
  const fetchAvailableFilters = async () => {
    try {
      const weekResponse = await axios.get('http://localhost:5000/api/available-weekss');
      setWeeks(weekResponse.data);

      const companyResponse = await axios.get('http://localhost:5000/api/companies');
      setCompanies(companyResponse.data);
    } catch (error) {
      console.error('Error fetching weeks or companies:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/filter-questions/${week}/${company}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('NO QUESTIONS');
    }
  };
  

  // Handle week change
  const handleWeekChange = (e) => {
    const selectedWeek = e.target.value;
    setWeek(selectedWeek);
    setIsUpdated(false);
    setQuestions([]); 
  };

  // Handle company change
  const handleCompanyChange = (e) => {
    const selectedCompany = e.target.value;
    setCompany(selectedCompany);
    setIsUpdated(false);
    setQuestions([]); 
  };

  // Handle change of question fields
  const handleInputChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  // Handle individual option change
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  // Add new option
  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  // Remove an option
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  // Update questions in the database
  const handleUpdate = async () => {
    try {
      await axios.put('http://localhost:5000/api/update-questionss', { questions });
      alert('Questions updated successfully!');
      setIsUpdated(true);
    } catch (error) {
      console.error('Error updating questions:', error);
      alert('Error updating questions.');
    }
  };

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  useEffect(() => {
    if (week && company) {
      fetchQuestions();
    }
  }, [week, company]);

  return (
    <div>
      <Adminnavbar/>
      <div className="update-container">
        <h2 className="header"><b>UPDATE QUESTIONS</b></h2>

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

        <label htmlFor="companySelect">
          Company:
          <select id="companySelect" value={company} onChange={handleCompanyChange} required>
            <option value="" disabled>Select a company</option>
            {companies.map((company, index) => (
              <option key={index} value={company}>{company}</option>
            ))}
          </select>
        </label>

        <div className="questions-container">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div key={question._id} className="question-card">
                <h3>Question {index + 1}:</h3>
                <textarea
                  value={question.question}
                  onChange={(e) => handleInputChange(index, 'question', e.target.value)}
                  placeholder="Edit question text"
                  rows="6"
                  className="question-input"
                />
                
                <div className="options-container">
                  <strong>Options:</strong>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="option-container">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="option-input"
                      />
                      <button onClick={() => removeOption(index, optIndex)} className="remove-option">
                        Remove
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addOption(index)} className="add-option">
                    Add Option
                  </button>
                </div>

                <div>
                  <strong>Correct Answer:</strong>
                  <input
                    type="text"
                    value={question.answer}
                    onChange={(e) => handleInputChange(index, 'answer', e.target.value)}
                    placeholder="Edit correct answer"
                    className="answer-input"
                  />
                </div>

                <div>
                  <strong>Explanation:</strong>
                  <textarea
                    value={question.explanation}
                    onChange={(e) => handleInputChange(index, 'explanation', e.target.value)}
                    placeholder="Edit explanation"
                    rows="4"
                    className="explanation-input"
                  />
                </div>
              </div>
            ))
          ) : (
            <p>No questions found for this week and company.</p>
          )}
        </div>

        <button className="update-button" onClick={handleUpdate} disabled={!week || !company || isUpdated}>
          Update Questions
        </button>

        <style jsx>{`
          .update-container {
            width: 80%;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin: 15px 0;
            font-weight: bold;
          }
          select, .update-button {
            padding: 8px;
            margin-top: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
            width: 100%;
          }
          .update-button {
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            margin-top: 20px; /* Add margin to separate the button */
          }
          .update-button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
          .questions-container {
            margin-top: 30px;
          }
          .question-card {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          .question-input, .answer-input, .explanation-input {
            width: 100%;
            padding: 8px;
            border-radius: 5px;
            border: 1px solid #ccc;
            margin-top: 8px;
          }
          .options-container {
            margin-top: 15px;
          }
          .option-container {
            display: flex;
            align-items: center;
            margin-top: 5px;
          }
          .option-input {
            flex: 1;
            padding: 6px;
            border-radius: 5px;
            border: 1px solid #ccc;
          }
          .add-option, .remove-option {
            background-color: #d9534f;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            margin-left: 10px;
            border-radius: 5px;
          }
          .add-option {
            background-color: #5bc0de;
            margin-top: 10px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default UpdateQuestions;
