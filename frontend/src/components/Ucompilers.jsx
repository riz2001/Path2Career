import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Usernavbar1 from './Usernavbar1';

const Ucompilers = () => {
    const [submissions, setSubmissions] = useState([]);
    const [error, setError] = useState(null);
    const [companyFilter, setCompanyFilter] = useState(''); // New state for company filter
    const userId = sessionStorage.getItem("userId"); // Retrieve userId from sessionStorage

    const fetchCompilerSubmissions = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/compiler-submissionsss`, {
                headers: {
                    'User-ID': userId,
                }
            });

            if (response.data.status === "success") {
                setSubmissions(response.data.submissions);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching compiler submissions:", error);
            setError("No Submissions Found.");
        }
    };

    useEffect(() => {
        fetchCompilerSubmissions(); // Fetch submissions when component mounts
    }, []);

    // Get unique company names for the filter dropdown
    const uniqueCompanies = Array.from(new Set(submissions.map(sub => sub.company)));

    // Filtered submissions based on selected company
    const filteredSubmissions = companyFilter
        ? submissions.filter(sub => sub.company === companyFilter)
        : submissions;

    // Inline CSS styles
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            width: '1300px',
            margin: '20px auto',
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
        },
        heading: {
            color: '#333333',
            fontSize: '24px',
            marginBottom: '20px',
        },
        filterContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            marginBottom: '15px',
        },
        filterLabel: {
            marginRight: '10px',
            fontSize: '16px',
        },
        select: {
            padding: '8px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ddd',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
        },
        th: {
            border: '1px solid #ddd',
            padding: '14px',
            textAlign: 'left',
            backgroundColor: '#007bff',
            color: 'white',
            fontSize: '16px',
        },
        td: {
            border: '1px solid #ddd',
            padding: '12px',
            textAlign: 'left',
            fontSize: '14px',
        },
        evenRow: {
            backgroundColor: '#f9f9f9',
        },
        hoverRow: {
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        error: {
            color: 'red',
            marginBottom: '20px',
        },
    };

    return (
        <div>
            <style>
                {`
                    body {
                        background-color: #f0f2f5;
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                    }
                `}
            </style>

            <Usernavbar1 />
            <div style={styles.container}>
                <h1 style={styles.heading}>Submission History</h1>
                {error && <p style={styles.error}>{error}</p>}
                
                <div style={styles.filterContainer}>
                    <label style={styles.filterLabel} htmlFor="companyFilter">Filter by Company:</label>
                    <select
                        id="companyFilter"
                        style={styles.select}
                        value={companyFilter}
                        onChange={(e) => setCompanyFilter(e.target.value)}
                    >
                        <option value="">All Companies</option>
                        {uniqueCompanies.map((company) => (
                            <option key={company} value={company}>{company}</option>
                        ))}
                    </select>
                </div>
                
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Week</th>
                            <th style={styles.th}>Submission Date</th>
                            <th style={styles.th}>Company</th>
                            <th style={styles.th}>Test Cases</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubmissions.map((submission, index) => (
                            <tr
                                key={submission._id}
                                style={{
                                    ...styles.hoverRow,
                                    ...(index % 2 === 0 ? styles.evenRow : {}),
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e8f4ff')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#fff')}
                            >
                                <td style={styles.td}>{submission.week}</td>
                                <td style={styles.td}>{new Date(submission.submissionDate).toLocaleString()}</td>
                                <td style={styles.td}>{submission.company}</td>
                                <td style={styles.td}>{submission.passedCount} / {submission.totalTestCases}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Ucompilers;
