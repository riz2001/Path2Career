import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


const BtechjobRegistrations = () => {
  const { jobId } = useParams(); // Get jobId from the URL
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCourseYear, setSelectedCourseYear] = useState('All');

  useEffect(() => {
    axios.get(`http://localhost:5000/jobs/${jobId}/btechregistrations`)
      .then(response => {
        if (response.data.status === 'success') {
          // Filter out any registrations with a null or missing user_id
          const validRegistrations = response.data.registrations.filter(reg => reg.user_id);
          setRegistrations(validRegistrations);
        } else {
          setError('Error fetching registrations');
        }
      })
      .catch(error => {
        console.error(error);
        setError('Error fetching registrations');
      });
  }, [jobId]);

  // Get unique course years for the dropdown from valid registrations
  const courseYears = [
    ...new Set(registrations.map(reg => reg.user_id && reg.user_id.courseYear).filter(Boolean))
  ];

  // Filter and sort registrations based on selected course year and roll number
  const filteredRegistrations = registrations
    .filter(reg => 
      (selectedCourseYear === 'All' || (reg.user_id && reg.user_id.courseYear === selectedCourseYear))
    )
    .sort((a, b) => a.user_id.rollno.localeCompare(b.user_id.rollno));

  // Count of filtered registrations
  const registrationCount = filteredRegistrations.length;

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!filteredRegistrations.length) {
    return <div style={styles.noRegistrations}>No registrations available for this job.</div>;
  }

  return (
    <div>
  

      <div>
        <div style={styles.registrationsContainer}>
          <h2 style={styles.title}>Users Registered for Job</h2>
          
          {/* Course Year Filter Dropdown */}
          <div style={styles.filterContainer}>
            <label style={styles.filterLabel}>Filter by Course Year: </label>
            <select 
              value={selectedCourseYear} 
              onChange={e => setSelectedCourseYear(e.target.value)} 
              style={styles.filterSelect}
            >
              <option value="All">All</option>
              {courseYears.map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Display the count of filtered registrations */}
          <div style={styles.countDisplay}>
            Number Of Registrations: {registrationCount}
          </div>

          <table style={styles.registrationsTable}>
            <thead>
              <tr>
                <th style={styles.th}>Roll No</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Admission Number</th>
                <th style={styles.th}>Course Year</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Applied At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg, index) => (
                <tr key={index} style={{ ...styles.tr, ...(index % 2 === 0 ? styles.trEven : {}) }} 
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f7fa'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                  <td style={styles.td}>{reg.user_id.rollno}</td>
                  <td style={styles.td}>{reg.user_id.name}</td>
                  <td style={styles.td}>{reg.user_id.admissionno}</td>
                  <td style={styles.td}>{reg.user_id.courseYear}</td>
                  <td style={styles.td}>{reg.user_id.email}</td>
                  <td style={styles.td}>{new Date(reg.applied_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Styles directly in the component for single-file use
const styles = {
  registrationsContainer: {
    maxWidth: '90%',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    color: '#007bff', // Blue color for title
    marginBottom: '20px',
  },
  noRegistrations: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#FF5722',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: '1.2rem',
    margin: '20px 0',
  },
  registrationsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#007bff', // Blue background for header
    color: 'white',
    textTransform: 'uppercase',
  },
  td: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '1rem',
    color: '#333',
  },
  tr: {
    backgroundColor: 'white',
    borderBottom: '1px solid #ddd',
    transition: 'background-color 0.2s ease',
  },
  trEven: {
    backgroundColor: '#f2f2f2',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '15px',
  },
  filterLabel: {
    fontSize: '1rem',
    marginRight: '10px',
  },
  filterSelect: {
    padding: '5px',
    fontSize: '1rem',
  },
  countDisplay: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#333',
    margin: '10px 0',
  },
};

export default BtechjobRegistrations;
