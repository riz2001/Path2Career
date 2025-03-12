import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Btechnavbar from './Btechnavbar';


function AddAnswers() {
    const [weeks, setWeeks] = useState([]); 
    const [selectedWeek, setSelectedWeek] = useState('');
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [code, setCode] = useState('');
    const [company, setCompany] = useState(''); // Add company state
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchAvailableWeeks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/compiler/weeks');
                setWeeks(response.data);
            } catch (err) {
                console.error('Error fetching weeks:', err);
                setError('Error fetching weeks. Please try again.');
            }
        };

        fetchAvailableWeeks();
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (selectedWeek) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/questions/week/${selectedWeek}`);
                    setQuestions(response.data);
                } catch (err) {
                    console.error('Error fetching questions:', err);
                    setError('Error fetching questions. Please try again.');
                }
            } else {
                setQuestions([]);
            }
        };

        fetchQuestions();
    }, [selectedWeek]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedQuestion || !code || !company) {
            setError('Please select a question, enter your code, and select a company.');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/compiler/save', {
                week: selectedWeek,
                questionId: selectedQuestion,
                code,
                company, // Include company in the saved data
            });
            alert('Question and code saved successfully!');
            setSuccessMessage('Question and code saved successfully!');
            setSelectedQuestion(null);
            setCode('');
            setCompany('');
            setError(null);
        } catch (err) {
            console.error('Error saving question:', err);
            setError('Error saving question. Please try again.');
        }
    };

    return (
        <div>
            <Btechnavbar/>
       
            <div style={styles.container}>
                <h2><center>ADD ANSWERS</center></h2>
                <div style={styles.formGroup}>
                    <label>Select Week:</label>
                    <select style={styles.weekSelector} value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
                        <option value="">--Select Week--</option>
                        {weeks.map((weekNum) => (
                            <option key={weekNum} value={weekNum}>{`Week ${weekNum}`}</option>
                        ))}
                    </select>
                </div>
                
                {questions.length > 0 ? (
                    <div style={styles.questionsList}>
                        <h3>Select a Question:</h3>
                        <div style={styles.questionsContainer}>
                            {questions.map((question) => (
                                <div
                                    key={question._id}
                                    onClick={() => setSelectedQuestion(question._id)}
                                    style={{
                                        ...styles.questionItem,
                                        backgroundColor: selectedQuestion === question._id ? '#e0e0e0' : '#fff',
                                    }}
                                >
                                    {question.title}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>No questions available for this week.</p>
                )}

                <form onSubmit={handleSubmit} style={styles.answerForm}>
                    <div style={styles.formGroup}>
                        <label>Code:</label>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            style={styles.codeInput}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label>Company:</label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    {error && <p style={styles.errorMessage}>{error}</p>}
                    {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
                    
                    <button type="submit" style={styles.submitButton}>Save Answer</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: 'auto',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    formGroup: {
        marginBottom: '20px',
    },
    weekSelector: {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff',
    },
    questionsList: {
        margin: '10px 0',
    },
    questionsContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    questionItem: {
        padding: '10px',
        margin: '5px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    errorMessage: {
        color: 'red',
    },
    successMessage: {
        color: 'green',
        textAlign: 'center',
    },
    answerForm: {
        display: 'flex',
        flexDirection: 'column',
    },
    codeInput: {
        width: '100%',
        height: '200px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginTop: '5px',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
    },
};

export default AddAnswers;
