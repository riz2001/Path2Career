import React, { useState } from 'react';
import axios from 'axios';


const Codingq = () => {
    // Question submission form state
    const [question, setQuestion] = useState({
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        testCases: [{ input: '', expectedOutput: '' }],
        difficulty: '',
        week: '',
        dueDate: '',
        company: '' // Added company field
    });

    const [questionSubmitStatus, setQuestionSubmitStatus] = useState(null);

    // Handle question form changes
    const handleQuestionChange = (e) => {
        setQuestion({ ...question, [e.target.name]: e.target.value });
    };

    // Handle test case changes
    const handleTestCaseChange = (index, e) => {
        const newTestCases = [...question.testCases];
        newTestCases[index][e.target.name] = e.target.value;
        setQuestion({ ...question, testCases: newTestCases });
    };

    // Add a new test case
    const addTestCase = () => {
        setQuestion({ ...question, testCases: [...question.testCases, { input: '', expectedOutput: '' }] });
    };

    // Submit question
    const submitQuestion = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/cquestions', question)
            .then(response => {
                setQuestionSubmitStatus(response.data.message);
                alert("Question submitted successfully!");
                // Reset the form if needed
                setQuestion({
                    title: '',
                    description: '',
                    inputFormat: '',
                    outputFormat: '',
                    testCases: [{ input: '', expectedOutput: '' }],
                    difficulty: '',
                    week: '',
                    dueDate: '',
                    company: '' // Reset company field
                });
            })
            .catch(err => {
                setQuestionSubmitStatus(err.response.data.error);
                alert("Error submitting question. Please try again.");
            });
    };

    return (
        <div>
      
            <div className="coding-question-container" style={styles.container}>
                <h1 className="form-title" style={styles.title}>ADD QUESTIONS</h1>
                <form className="question-form" onSubmit={submitQuestion}>
                    <input
                        type="text"
                        name="company" // Added company input
                        placeholder="Company"
                        value={question.company}
                        onChange={handleQuestionChange}
                        required
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={question.title}
                        onChange={handleQuestionChange}
                        required
                        style={styles.input}
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={question.description}
                        onChange={handleQuestionChange}
                        required
                        style={styles.textarea}
                    />
                    <input
                        type="text"
                        name="inputFormat"
                        placeholder="Input Format"
                        value={question.inputFormat}
                        onChange={handleQuestionChange}
                        required
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="outputFormat"
                        placeholder="Output Format"
                        value={question.outputFormat}
                        onChange={handleQuestionChange}
                        required
                        style={styles.input}
                    />

                    {/* Test Cases */}
                    <h3>Test Cases</h3>
                    {question.testCases.map((testCase, index) => (
                        <div key={index} className="test-case-container" style={styles.testCaseContainer}>
                            <textarea
                                type="text"
                                name="input"
                                placeholder="Input"
                                value={testCase.input}
                                onChange={(e) => handleTestCaseChange(index, e)}
                                style={styles.input}
                            />
                            <input
                                type="text"
                                name="expectedOutput"
                                placeholder="Expected Output"
                                value={testCase.expectedOutput}
                                onChange={(e) => handleTestCaseChange(index, e)}
                                style={styles.input}
                            />
                        </div>
                    ))}
                    <button type="button" className="add-test-case-button" onClick={addTestCase} style={styles.addButton}>Add Test Case</button>

                    <input
                        type="text"
                        name="difficulty"
                        placeholder="Difficulty (easy, medium, hard)"
                        value={question.difficulty}
                        onChange={handleQuestionChange}
                        required
                        style={styles.input}
                    />
                    <input
                        type="number"
                        name="week"
                        placeholder="Week Number"
                        value={question.week}
                        onChange={handleQuestionChange}
                        required
                        style={styles.input}
                    />

                    {/* Due Date Field */}
                    <div style={styles.dueDateContainer}>
                        <label style={styles.label}>Due Date:</label>
                        <input
                            type="date"
                            name="dueDate"
                            placeholder="Due Date"
                            value={question.dueDate}
                            onChange={handleQuestionChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button" style={styles.submitButton}>Submit Question</button>
                </form>

                {questionSubmitStatus && <p className="submit-status" style={styles.status}>{questionSubmitStatus}</p>}
            </div>
        </div>
    );
};

// Inline styles
const styles = {
    container: {
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        height: '100px',
    },
    testCaseContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
    },
    addButton: {
        padding: '10px 15px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    dueDateContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '5px',
    },
    submitButton: {
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    status: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#d9534f', // Error color
    },
};

export default Codingq;
