import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Usernavbar1 from './Usernavbar1';

const Interviewdelete = () => {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState(null);

  const fetchInterviews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/interviewss');
      if (response.data.status === 'success') {
        setInterviews(response.data.interviews);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Error fetching interviews.');
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleDeleteInterview = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/interviews/${id}`);
      setInterviews(interviews.filter(interview => interview._id !== id));
    } catch (err) {
      console.error('Error deleting interview:', err);
      alert('Error deleting interview.');
    }
  };

  const handleDeleteAllSubmissionsForWeek = async (week) => {
    try {
        await axios.delete(`http://localhost:5000/submissions/week/${week}`);

        // No need to filter interviews, since we're deleting submissions, not interviews
        alert(`All submissions for week ${week} deleted successfully.`);
    } catch (err) {
        console.error('Error deleting all submissions for the week:', err);
        alert('Error deleting all submissions for this week.');
    }
};

  return (
    <div>
      <Usernavbar1 />
      <div style={{ width: '80%', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>Interview Management</h1>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '10px', backgroundColor: '#007bff', color: 'white' }}>Job Position</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', backgroundColor: '#007bff', color: 'white' }}>Week</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', backgroundColor: '#007bff', color: 'white' }}>Actions</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', backgroundColor: '#007bff', color: 'white' }}>Delete All Interviews for Job</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{interview.jobPosition}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{interview.week}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                  <button
                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
                    onClick={() => handleDeleteInterview(interview._id)}
                  >
                    Delete Interview
                  </button>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
  <button
    onClick={() => handleDeleteAllSubmissionsForWeek(interview.week)}
    style={{
      padding: '8px 12px',
      backgroundColor: '#ff9800', // Orange color for distinction
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: '0.3s ease',
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = '#e68900')} // Darker shade on hover
    onMouseOut={(e) => (e.target.style.backgroundColor = '#ff9800')}
  >
     Delete All Submissions for Week {interview.week}
  </button>
</td>
 </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Interviewdelete;