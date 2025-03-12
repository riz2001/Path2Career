import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Usernavbar1 from './Usernavbar1';

const Passeddisplay = () => {
    const [weeks, setWeeks] = useState([]);
    const [companies, setCompanies] = useState([]); // State to hold companies
    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(''); // State to hold selected company
    const [questions, setQuestions] = useState([]);
    const [codes, setCodes] = useState([]);
    const [error, setError] = useState(null);

    // Fetch available weeks
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

    // Fetch questions and codes when a week is selected
    useEffect(() => {
        const fetchQuestionsAndCodes = async () => {
            if (selectedWeek) {
                try {
                    // Fetch questions for the selected week
                    const questionsResponse = await axios.get(`http://localhost:5000/api/questions/week/${selectedWeek}`);
                    setQuestions(questionsResponse.data);

                    // Extract unique companies from the fetched questions
                    const uniqueCompanies = [...new Set(questionsResponse.data.map(q => q.company))];
                    setCompanies(uniqueCompanies);

                    // Fetch passed test case codes for the selected week
                    const codesResponse = await axios.get(`http://localhost:5000/api/passedTestCases/week/${selectedWeek}`);
                    setCodes(codesResponse.data);
                } catch (err) {
                    console.error('Error fetching questions or codes:', err);
                    setError('No Codes Available');
                }
            } else {
                setQuestions([]);
                setCodes([]);
                setCompanies([]); // Reset companies when week is not selected
            }
        };

        fetchQuestionsAndCodes();
    }, [selectedWeek]);

    const handleWeekChange = (e) => {
        setSelectedWeek(e.target.value);
        setSelectedCompany(''); // Reset selected company when week changes
    };

    const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value);
    };

    return (
        <div>
            <Usernavbar1 />
            <div style={styles.container}>
                <h2><b><center>SOLUTIONS</center></b></h2>
                <div style={styles.weekSelector}>
                    <label>Select Week:</label>
                    <select
                        value={selectedWeek}
                        onChange={handleWeekChange}
                        style={styles.select}
                    >
                        <option value="">--Select Week--</option>
                        {weeks.map((weekNum) => (
                            <option key={weekNum} value={weekNum}>{`Week ${weekNum}`}</option>
                        ))}
                    </select>
                </div>
                {selectedWeek && (
                    <div style={styles.companySelector}>
                        <label>Select Company:</label>
                        <select
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            style={styles.select}
                        >
                            <option value="">--Select Company--</option>
                            {companies.map((company, index) => (
                                <option key={index} value={company}>{company}</option>
                            ))}
                        </select>
                    </div>
                )}
                {error && <p style={styles.error}>{error}</p>}
                {selectedWeek && questions.length > 0 ? (
                    <div style={styles.questionsContainer}>
                        <h3>Solution for Week {selectedWeek}</h3>
                        {questions.filter(q => !selectedCompany || q.company === selectedCompany).map((question) => (
                            <div key={question._id} style={styles.questionCard}>
                                <h4 style={styles.questionTitle}>Question: {question.title}</h4>
                                <p style={styles.questionText}>Company: {question.company}</p> {/* Display company name */}
                                <p style={styles.questionText}>{question.text}</p>
                                <br />
                                {/* Separate container for code solutions */}
                                <div style={styles.codeWrapper}>
                                    <h5>Code Solutions:</h5>
                                    {codes
                                        .filter(code => code.week === selectedWeek && code.company === question.company) // Filter by company and week
                                        .map((code) => (
                                            <div key={code._id} style={styles.codeCard}>
                                                <pre style={styles.codeBlock}>
                                                    {code.code}
                                                </pre>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    selectedWeek && <p>No questions or codes available for this week.</p>
                )}
            </div>
        </div>
    );
};

// Styles as a JavaScript object
const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: 'auto',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    weekSelector: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    },
    companySelector: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    },
    select: {
        marginRight: '10px',
        padding: '8px',
        fontSize: '16px',
    },
    questionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    questionCard: {
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    questionTitle: {
        marginBottom: '10px',
    },
    questionText: {
        margin: '10px 0',
    },
    codeWrapper: {
        marginTop: '15px',
    },
    codeCard: {
        padding: '15px',
        marginTop: '15px',
        border: '2px solid #007bff', // Highlighted border color
        borderRadius: '5px',
        backgroundColor: '#f5f5f5',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
    codeBlock: {
        color: '#333',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        overflowX: 'auto',
        fontSize: '14px',
    },
    passedText: {
        marginTop: '10px',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: '10px',
    },
};

export default Passeddisplay;
