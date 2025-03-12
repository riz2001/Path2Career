import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Btechnavbar from './Btechnavbar';
import Adminnavbar from './Adminnavbar';


const Codingupdate = () => {
    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [uniqueCompanies, setUniqueCompanies] = useState([]); // Store unique companies

    // Fetch questions when a week is selected
    const handleWeekChange = (e) => {
        const week = e.target.value;
        setSelectedWeek(week);
        if (week) {
            fetchWeeklyData(week);
        }
    };

    // Fetch data for the selected week and filter companies
    const fetchWeeklyData = (week) => {
        setLoading(true);
        axios.get(`http://localhost:5000/api/cquestionss?week=${week}`)
            .then(response => {
                const data = response.data;
                setQuestions(data);
                const companies = [...new Set(data.map(q => q.company))];
                setUniqueCompanies(companies);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching weekly data:', error);
                setLoading(false);
            });
    };

    // Handle input changes for editing fields
    const handleInputChange = (index, e) => {
        const { name, value } = e.target;
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [name]: value };
        setQuestions(updatedQuestions);
    };

    // Handle test case input changes
    const handleTestCaseChange = (questionIndex, testCaseIndex, e) => {
        const { name, value } = e.target;
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].testCases[testCaseIndex] = {
            ...updatedQuestions[questionIndex].testCases[testCaseIndex],
            [name]: value,
        };
        setQuestions(updatedQuestions);
    };

    // Add a new test case
    const addTestCase = (index) => {
        const newTestCase = { input: '', expectedOutput: '' };
        const updatedQuestions = [...questions];
        updatedQuestions[index].testCases.push(newTestCase);
        setQuestions(updatedQuestions);
    };

    // Update the question in the database
    const updateQuestion = (questionId, index) => {
        const questionToUpdate = questions[index];
        axios.put(`http://localhost:5000/api/cquestionss/${questionId}`, questionToUpdate)
            .then(() => {
                fetchWeeklyData(selectedWeek);
                setSuccessMessage('Question updated successfully!');
                alert('Question updated successfully!')
                setTimeout(() => setSuccessMessage(''), 3000);
            })
            .catch(error => {
                console.error('Error updating question:', error);
            });
    };

    // Filter questions by selected company
    const filteredQuestions = selectedCompany 
        ? questions.filter(q => q.company === selectedCompany) 
        : questions;

    return (
        <div>
            <Adminnavbar/>
            <div style={styles.container}>
                <h1 style={styles.title}>Update Coding Questions</h1>

                {/* Week Selection */}
                <div style={styles.weekSelection}>
                    <label style={styles.label}>Select Week:</label>
                    <input
                        type="number"
                        placeholder="Enter Week Number"
                        value={selectedWeek}
                        onChange={handleWeekChange}
                        style={styles.input}
                    />
                </div>

                {/* Company Filter */}
                {uniqueCompanies.length > 0 && (
                    <div style={styles.weekSelection}>
                        <label style={styles.label}>Filter by Company:</label>
                        <select
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            style={styles.input}
                        >
                            <option value="">All Companies</option>
                            {uniqueCompanies.map((company, idx) => (
                                <option key={idx} value={company}>{company}</option>
                            ))}
                        </select>
                    </div>
                )}

                {loading ? (
                    <p style={styles.loading}>Loading...</p>
                ) : (
                    filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question, index) => (
                            <div key={question._id} style={styles.questionContainer}>
                                {question.company && <h3 style={styles.companyHeading}>{question.company}</h3>}
                                <label style={styles.descriptionLabel}>Title:</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter Title"
                                    value={question.title}
                                    onChange={(e) => handleInputChange(index, e)}
                                    style={styles.editInput}
                                />

                                <label style={styles.descriptionLabel}>Description:</label>
                                <textarea
                                    name="description"
                                    placeholder="Enter Description"
                                    value={question.description}
                                    onChange={(e) => handleInputChange(index, e)}
                                    style={styles.editTextarea}
                                />

                                <label style={styles.descriptionLabel}>Input Format:</label>
                                <input
                                    type="text"
                                    name="inputFormat"
                                    placeholder="Enter Input Format"
                                    value={question.inputFormat}
                                    onChange={(e) => handleInputChange(index, e)}
                                    style={styles.editInput}
                                />

                                <label style={styles.descriptionLabel}>Output Format:</label>
                                <input
                                    type="text"
                                    name="outputFormat"
                                    placeholder="Enter Output Format"
                                    value={question.outputFormat}
                                    onChange={(e) => handleInputChange(index, e)}
                                    style={styles.editInput}
                                />

                                {/* Test Cases */}
                                <h3>Test Cases</h3>
                                {question.testCases.map((testCase, testCaseIndex) => (
                                    <div key={testCaseIndex} style={styles.testCaseContainer}>
                                        <textarea
                                            name="input"
                                            placeholder="Input"
                                            value={testCase.input}
                                            onChange={(e) => handleTestCaseChange(index, testCaseIndex, e)}
                                            style={styles.input}
                                        />
                                        <textarea
                                            name="expectedOutput"
                                            placeholder="Expected Output"
                                            value={testCase.expectedOutput}
                                            onChange={(e) => handleTestCaseChange(index, testCaseIndex, e)}
                                            style={styles.input}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addTestCase(index)}
                                    style={styles.addButton}
                                >
                                    Add Test Case
                                </button>
                                <button
                                    onClick={() => updateQuestion(question._id, index)}
                                    style={styles.updateButton}
                                >
                                    Update
                                </button>
                            </div>
                        ))
                    ) : (
                        selectedWeek && <p style={styles.noData}>No questions available for the selected week.</p>
                    )
                )}

                {successMessage && <div style={styles.alert}>{successMessage}</div>}
            </div>
        </div>
    );
};

// Inline styles for the component
const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        fontSize: '24px',
        color: '#333',
        marginBottom: '20px',
    },
    weekSelection: {
        marginBottom: '20px',
    },
    label: {
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    loading: {
        textAlign: 'center',
        fontSize: '18px',
    },
    questionContainer: {
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '6px',
    },
    descriptionLabel: {
        marginTop: '10px',
        fontWeight: 'bold',
    },
    editInput: {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    editTextarea: {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        resize: 'vertical',
    },
    testCaseContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
    },
    addButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    updateButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    noData: {
        textAlign: 'center',
        fontSize: '18px',
        color: '#777',
    },
    alert: {
        textAlign: 'center',
        fontSize: '16px',
        color: 'green',
        marginTop: '20px',
    },
    companyHeading: {
        fontSize: '18px',
        color: '#007bff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
};

export default Codingupdate;
