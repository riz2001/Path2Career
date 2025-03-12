import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Adminnavbar from './Adminnavbar';



function Passedtestcass() {
    const [week, setWeek] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [companyFilter, setCompanyFilter] = useState('');
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch available weeks on component mount
    useEffect(() => {
        const fetchWeeks = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/compiler/weeks');
                setWeeks(res.data);
            } catch (err) {
                console.error('Error fetching weeks:', err);
                setError('Error fetching weeks. Please try again.');
            }
        };

        fetchWeeks();
    }, []);

    // Fetch available companies after submissions are fetched
    useEffect(() => {
        if (submissions.length > 0) {
            const uniqueCompanies = [...new Set(submissions.map(submission => submission.company))];
            setCompanies(uniqueCompanies);
        }
    }, [submissions]);

    const handleWeekChange = (e) => {
        setWeek(e.target.value);
        setSubmissions([]);        // Clear previous submissions
        setCompanyFilter('');       // Reset company filter
        setCompanies([]);           // Clear the companies list for the new week
        setError(null);             // Clear any error messages
    };

    const handleCompanyChange = (e) => {
        setCompanyFilter(e.target.value);
    };

    const fetchPassedCodes = async () => {
        if (!week) {
            setError('Please select a week.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(`http://localhost:5000/api/compiler/week/${week}`);
            const updatedSubmissions = res.data.map(submission => ({ ...submission, submitted: false }));
            setSubmissions(updatedSubmissions);
        } catch (err) {
            console.error('Error fetching passed codes:', err);
            setError('No Code Available.');
        } finally {
            setLoading(false);
        }
    };

    const saveToDatabase = async (submission) => {
        try {
            await axios.post('http://localhost:5000/api/compiler/save', {
                week,
                questionId: submission.questionId._id,
                code: submission.code,
                passedCount: submission.passedCount,
                totalTestCases: submission.totalTestCases,
                questionTitle: submission.questionId.title,
                company: submission.company
            });
            alert('Submitted successfully');
            setSubmissions(prevSubmissions =>
                prevSubmissions.map(sub =>
                    sub._id === submission._id ? { ...sub, submitted: true } : sub
                )
            );
        } catch (err) {
            console.error('Error saving data:', err);
            alert('No Code Available.');
        }
    };

    const handleAddAnswers = () => {
        navigate('/addanswers');
    };

    // Filtered submissions based on the selected company
    const filteredSubmissions = companyFilter 
        ? submissions.filter(submission => submission.company === companyFilter) 
        : submissions;

    return (
        <div>
            <Adminnavbar/>

            <div style={styles.container}>
                <h2 style={styles.header}><center><b>SUBMIT SOLUTIONS</b></center></h2>
                
                <div style={styles.weekSelector}>
                    <label>Select Week:</label>
                    <select value={week} onChange={handleWeekChange} style={styles.select}>
                        <option value="">--Select Week--</option>
                        {weeks.map((weekNum) => (
                            <option key={weekNum} value={weekNum}>{`Week ${weekNum}`}</option>
                        ))}
                    </select>

                    <button onClick={fetchPassedCodes} style={styles.button} disabled={loading}>
                        {loading ? 'Loading...' : 'Fetch Passed Codes'}
                    </button>
                    <button onClick={handleAddAnswers} style={{ ...styles.button, marginLeft: '10px' }}>
                        Add Answers
                    </button>
                </div>

                {/* Company Filter */}
                {companies.length > 0 && (
                    <div style={styles.companyFilter}>
                        <label>Select Company:</label>
                        <select value={companyFilter} onChange={handleCompanyChange} style={styles.select}>
                            <option value="">--All Companies--</option>
                            {companies.map((company) => (
                                <option key={company} value={company}>{company}</option>
                            ))}
                        </select>
                    </div>
                )}

                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.submissionsList}>
                    {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission) => (
                            <div key={submission._id} style={styles.submissionItem}>
                                <p><strong>Question Title:</strong> {submission.questionId.title}</p>
                                <p><strong>Company:</strong> {submission.company}</p>
                                <p><strong>Code:</strong></p>
                                <pre style={styles.code}>{submission.code}</pre>
                                <button 
                                    onClick={() => saveToDatabase(submission)} 
                                    style={styles.button} 
                                    disabled={submission.submitted}
                                >
                                    {submission.submitted ? 'Submitted' : 'SUBMIT'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No submissions available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Passedtestcass;

const styles = {
    container: {
        width: '80%',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    weekSelector: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    },
    companyFilter: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    },
    select: {
        marginRight: '10px',
        padding: '8px',
        fontSize: '16px',
    },
    button: {
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    submissionsList: {
        marginTop: '20px',
    },
    submissionItem: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        border: '2px solid #007bff',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: '10px',
    },
    code: {
        backgroundColor: '#f1f1f1',
        padding: '10px',
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
    },
};
