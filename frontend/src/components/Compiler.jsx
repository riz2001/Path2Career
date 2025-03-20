import React, { useState, useEffect, useRef } from 'react';
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

  // Timer state: 30 seconds countdown
  const [timeLeft, setTimeLeft] = useState(30);
  // Use a ref to ensure auto submission is triggered only once.
  const autoSubmitCalled = useRef(false);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/cquestions/week/${week}/company/${company}`);
        setQuestions(res.data);
        if (res.data.length > 0) {
          // Optionally auto-select the first question if desired:
          // setSelectedQuestion(res.data[0]);
          setDueDate(res.data[0].dueDate);
        }
      } catch (err) {
        console.error('Error fetching questions for the week and company', err);
      }
    };
    if (week && company) fetchQuestions();
  }, [week, company]);

  // Timer useEffect: counts down every second and auto-submits when timeLeft reaches 0.
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          if (!autoSubmitCalled.current) {
            autoSubmitCalled.current = true;
            // If no question is selected, default to the first question
            if (!selectedQuestion && questions.length > 0) {
              setSelectedQuestion(questions[0]);
            }
            // For auto-submission, pass true so that test result check is skipped.
            handleFinalSubmission(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [questions, selectedQuestion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/compiler/run', {
        code,
        language,
        input,
        expectedOutput,
      });
      if (res.data.success) {
        setOutput(res.data.output);
      } else {
        setOutput(res.data.error || 'Unknown error occurred.');
      }
    } catch (error) {
      console.error('Error running the code:', error);
      setOutput(
        (error.response && error.response.data && error.response.data.error) ||
        'Error running the code.'
      );
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
        passed: passed,
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

  // Final submission: if isAuto is true, skip the test result check.
  const handleFinalSubmission = async (isAuto = false) => {
    if (!selectedQuestion) {
      alert('No question available to submit.');
      return;
    }
    // For manual submission, require test results.
    if (!isAuto && testResult.length === 0) {
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
      code: code,
      company: company,
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  return (
    <div>
      <Usernavbar1 />
      <div style={styles.app}>
        <h1 style={styles.title}><b>CODING TEST</b></h1>
        {dueDate && (
          <div style={styles.dueDateContainer}>
            <strong>Due Date: {new Date(dueDate).toLocaleDateString()}</strong>
          </div>
        )}
        {/* Timer Display */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h3>Time Left: {formatTime(timeLeft)}</h3>
        </div>

        {questions.length > 0 && (
          <div style={styles.questionsList}>
            <h2>Questions for Week {week}</h2>
            <ul style={styles.questionList}>
              {questions.map((question) => (
                <li
                  key={question._id}
                  onClick={() => handleQuestionSelect(question)}
                  style={styles.questionItem}
                >
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
            <div style={{ display: 'flex' }}>
              <div style={styles.lineNumbers}>
                {code.split('\n').map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
              <textarea
                style={styles.codeEditor}
                rows="10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
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
            <button type="submit" style={styles.runButton}>Run Code</button>
          </div>
        </form>

        <div style={styles.resultsContainer}>
          <div style={styles.outputColumn}>
            <h3>Output:</h3>
            <pre>{output}</pre>
          </div>
          <div style={styles.testResultsColumn}>
            <h3>Test Result:</h3>
            {Array.isArray(testResult) &&
              testResult.map((result, index) => (
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
            <button onClick={runAllTestCases} style={styles.loadButton}>Run All Test Cases</button>
            <button onClick={() => handleFinalSubmission()} style={styles.submitButton}>Submit Solution</button>
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
    fontSize: '1.2em',
    color: 'red',
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
  inputContainer: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  select: {
    width: '100%',
    padding: '8px',
    fontSize: '16px',
  },
  lineNumbers: {
    padding: '10px',
    backgroundColor: '#f7f7f7',
    color: '#555',
    textAlign: 'right',
    marginRight: '10px',
    userSelect: 'none',
  },
  codeEditor: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    fontFamily: 'monospace',
  },
  runButtonContainer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  runButton: {
    width: '20%',
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
