import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Usernavbar1 from './Usernavbar1';


function Compiler() {
    const { week, company } = useParams();
    const [questions, setQuestions] = useState([]);
    const [dueDate, setDueDate] = useState('');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [expectedOutput, setExpectedOutput] = useState('');
    const [testResult, setTestResult] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [passedCount, setPassedCount] = useState(0);
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/cquestions/week/${week}/company/${company}`);
                setQuestions(res.data);
                if (res.data.length > 0) {
                    setDueDate(res.data[0].dueDate);
                }
            } catch (err) {
                console.error('Error fetching questions for the week and company', err);
            }
        };
        
        if (week && company) fetchQuestions();
    }, [week, company]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/compiler/run', {
                code,
                language,
                input,
                expectedOutput,
            });
            setOutput(res.data.output);
        } catch (error) {
            console.error('Error running the code:', error);
            setOutput('Error running the code.');
        }
    };

    const handleQuestionSelect = (question) => {
        setSelectedQuestion(question);
        setInput('');
        setExpectedOutput('');
        setTestResult([]);
        setPassedCount(0);
    };

    const runWithTestCase = async (testCase) => {
        setInput(testCase.input);
        setExpectedOutput(testCase.expectedOutput);
        try {
            const res = await axios.post('http://localhost:5000/api/compiler/run', {
                code,
                language,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
            });
            const actualOutput = res.data.output;
            const passed = actualOutput.trim() === testCase.expectedOutput.trim();
            setOutput(actualOutput);
            setTestResult([{
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: actualOutput,
                passed: passed
            }]);
        } catch (error) {
            console.error('Error running the code with test case:', error);
            setOutput('Error running the code with test case.');
            setTestResult([]);
        }
    };

    const runAllTestCases = async () => {
        if (!selectedQuestion || !selectedQuestion.testCases) return;
        const results = [];
        let passCount = 0;
        for (const testCase of selectedQuestion.testCases) {
            try {
                const res = await axios.post('http://localhost:5000/api/compiler/run', {
                    code,
                    language,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                });
                const actualOutput = res.data.output;
                const passed = actualOutput.trim() === testCase.expectedOutput.trim();
                results.push({
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: actualOutput,
                    passed: passed,
                });
                if (passed) passCount++;
            } catch (error) {
                console.error('Error running the code with test case:', error);
                results.push({
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: 'Error running the code.',
                    passed: false,
                });
            }
        }
        setTestResult(results);
        setPassedCount(passCount);
    };

    const handleFinalSubmission = async () => {
        if (!selectedQuestion || !testResult.length) {
            alert('No test results found. Please run the test cases first.');
            return;
        }
        const userId = sessionStorage.getItem('userId');
        const submissionData = {
            userId,
            week,
            questionId: selectedQuestion._id,
            passedCount,
            totalTestCases: selectedQuestion.testCases.length,
            testResults: testResult,
            dueDate: selectedQuestion.dueDate,
            code: code ,
            company:company // Use the code from state instead of selectedQuestion
        };
        try {
            const res = await axios.post('http://localhost:5000/api/compilerSubmissions', submissionData, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            console.log('Submission Response:', res.data);
            alert('Submission recorded successfully!');
        } catch (error) {
            console.error('Error submitting the solution:', error);
            if (error.response && error.response.status === 400 && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert('Error recording submission. Please try again later.');
            }
        }
    };
    

    return (
        <div>
            <Usernavbar1/>
          
            <div style={styles.app}>
                <h1 style={styles.title}><b>CODING TEST</b></h1>
                {dueDate && (
    <div style={styles.dueDateContainer}>
        <strong>Due Date: {new Date(dueDate).toLocaleDateString()}</strong>
    </div>
)}

                {questions.length > 0 && (
                    <div style={styles.questionsList}>
                        <h2>Questions for Week {week}</h2>
                        <ul style={styles.questionList}>
                            {questions.map((question) => (
                                <li key={question._id} onClick={() => handleQuestionSelect(question)} style={styles.questionItem}>
                                    <strong>{question.title}</strong>
                                    <p>{question.description}</p>
                                    <div style={styles.questionDetails}>
                                        <p style={styles.formatText}><strong>Input Format:</strong> {question.inputFormat}</p>
                                        <p style={styles.formatText}><strong>Output Format:</strong> {question.outputFormat}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputContainer}>
                        <label style={styles.label}>Language:</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={styles.select}
                        >
                            <option value="python">Python</option>
                            <option value="c">C</option>
                            <option value="java">Java</option>
                        </select>
                    </div>

                    <div style={styles.inputContainer}>
                        <label style={styles.label}>Code:</label>
                        <textarea
                            style={styles.codeEditor}
                            rows="10"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>

                    <div style={styles.inputContainer}>
                        <label style={styles.label}>Input:</label>
                        <textarea
                            style={styles.codeEditor}
                            rows="3"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                 
    <div style={styles.runButtonContainer}>
        <button type="submit" style={styles.runButton}>
            Run Code
        </button>
    </div>
                </form>

                <div style={styles.resultsContainer}>
                    <div style={styles.outputColumn}>
                        <h3>Output:</h3>
                        <pre>{output}</pre>
                    </div>
                    <div style={styles.testResultsColumn}>
                        <h3>Test Result:</h3>
                        {Array.isArray(testResult) && testResult.map((result, index) => (
                            <div key={index} style={result.passed ? styles.testPassed : styles.testFailed}>
                                <p>
                                    <strong>Input:</strong> {result.input}<br />
                                    <strong>Expected Output:</strong> {result.expectedOutput}<br />
                                    <strong>Actual Output:</strong> {result.actualOutput}<br />
                                    <strong>Test Case {result.passed ? 'Passed' : 'Failed'}</strong>
                                </p>
                            </div>
                        ))}
                        <h3>{`Passed ${passedCount} out of ${testResult.length} test cases`}</h3>
                    </div>
                </div>

                {selectedQuestion && (
                    <div style={styles.buttonContainer}>
                        <button onClick={runAllTestCases} style={styles.loadButton}>
                            Run All Test Cases
                        </button>
                        <button onClick={handleFinalSubmission} style={styles.submitButton}>
                            Submit Solution
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Compiler;

const styles = {
    app: {
        width: '80%',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        fontSize: '2em',
        color: '#333',
        marginBottom: '20px',
    },
    dueDateContainer: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    questionList: {
        listStyleType: 'none',
        padding: 0,
    },
    questionItem: {
        backgroundColor: '#fff',
        margin: '10px 0',
        padding: '15px',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    questionItemHover: {
        backgroundColor: '#e9ecef',
    },
    inputContainer: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
    },
    select: {
        width: '100%',
        padding: '8px',
        fontSize: '16px',
    },
    codeEditor: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        fontFamily: 'monospace',
    },
    runButtonContainer: {
        textAlign: 'center',  // Center align the button
        marginTop: '20px',    // Add some space above the button
    },
    runButton: {
        width: '20%',         // Reduce the width to 50% of the container
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px',
        fontSize: '16px',
        cursor: 'pointer',
        borderRadius: '5px',
        border: 'none',
    },
    
    resultsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    outputColumn: {
        width: '45%',
    },
    testResultsColumn: {
        width: '45%',
    },
    testPassed: {
        backgroundColor: '#d4edda',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
    },
    testFailed: {
        backgroundColor: '#f8d7da',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    loadButton: {
        flex: 1,
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px',
        fontSize: '16px',
        marginRight: '10px',
        cursor: 'pointer',
        borderRadius: '5px',
        border: 'none',
    },
    dueDateContainer: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '1.2em',
        color: 'red',  // Set the due date text color to red
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px',
        fontSize: '16px',
        marginLeft: '10px',
        cursor: 'pointer',
        borderRadius: '5px',
        border: 'none',
    },
};
