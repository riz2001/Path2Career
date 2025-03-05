import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Mbanavbar from './Mbanavbar';



function Mbaweekcompilers() {
    const [weeks, setWeeks] = useState([]);

    useEffect(() => {
        const fetchWeeks = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/compilerSubmissionss');
                const weeksArray = Object.keys(res.data).map(week => ({
                    week: parseInt(week),
                    submissions: res.data[week],
                }));
                setWeeks(weeksArray);
            } catch (err) {
                console.error('Error fetching submissions:', err);
            }
        };

        fetchWeeks();
    }, []);

    return (
        <div>
        <Mbanavbar/>
            <div style={styles.app}>
                <h1 style={styles.title}>All Weeks Coding Submissions</h1>
                {weeks.length === 0 ? (
                    <p>No submissions found.</p>
                ) : (
                    weeks.map(({ week, submissions }) => (
                        <div key={week} style={styles.weekContainer}>
                            <h2 style={styles.weekTitle}>
                                <Link to={`/mbasubmissions/week/${week}`} style={styles.link}>
                                    Week {week}
                                </Link>
                            </h2>
                            <p style={styles.submissionCount}>
                                Total Submissions: {submissions.length}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Mbaweekcompilers;

// Styles
const styles = {
    app: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    title: {
        fontSize: '2em',
        marginBottom: '20px',
    },
    weekContainer: {
        marginBottom: '20px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#fff', // Set the background color to white
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Optional: add a subtle shadow
    },
    weekTitle: {
        fontSize: '1.5em',
        marginBottom: '10px',
    },
    submissionCount: {
        marginBottom: '10px',
    },
    link: {
        textDecoration: 'none',
        color: '#007bff',
    },
};
