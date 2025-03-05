import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Usernavbar1 from './Usernavbar1';

const Qusers = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]); // State for filtered data
  const [companies, setCompanies] = useState([]); // State to store unique companies
  const [selectedCompany, setSelectedCompany] = useState(""); // State for selected company filter
  const [error, setError] = useState(null);
  const userId = sessionStorage.getItem("userId"); // Retrieve userId from sessionStorage

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/submissionsss`, {
        headers: {
          'User-ID': userId, // Add userId to headers
        }
      });

      if (response.data.status === "success") {
        const data = response.data.submissions;
        setSubmissions(data);
        setFilteredSubmissions(data);

        // Extract unique companies for the filter
        const uniqueCompanies = [...new Set(data.map(submission => submission.company))];
        setCompanies(uniqueCompanies);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("No submissions Found.");
    }
  };

  useEffect(() => {
    fetchSubmissions(); // Call the fetch function when the component mounts
  }, []);

  // Handle change for company filter
  const handleCompanyChange = (event) => {
    const selected = event.target.value;
    setSelectedCompany(selected);
    setFilteredSubmissions(
      selected === ""
        ? submissions
        : submissions.filter(submission => submission.company === selected)
    );
  };

  // Inline CSS styles
  const styles = {
    container: {
      display: 'flex',
      width: '1300px',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
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
      alignItems: 'center',
      marginBottom: '20px',
    },
    filterLabel: {
      marginRight: '10px',
      fontSize: '16px',
    },
    filterSelect: {
      padding: '8px',
      fontSize: '16px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
    },
    th: {
      border: '1px solid #ddd',
      padding: '12px',
      textAlign: 'left',
      backgroundColor: '#007bff',
      color: 'white',
      fontSize: '16px',
    },
    td: {
      border: '1px solid #ddd',
      padding: '10px',
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
          <label style={styles.filterLabel}>Filter by Company:</label>
          <select 
            value={selectedCompany} 
            onChange={handleCompanyChange} 
            style={styles.filterSelect}
          >
            <option value="">All Companies</option>
            {companies.map((company, index) => (
              <option key={index} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Week</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Submission Time</th>
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
                <td style={styles.td}>{submission.score}</td>
                <td style={styles.td}>{submission.company}</td>
                <td style={styles.td}>{new Date(submission.submissionTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Qusers;
