import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Usernavbar1 from './Usernavbar1';

const UserInterviewHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [error, setError] = useState(null);
  
  const userId = sessionStorage.getItem("userId"); // Get userId from sessionStorage

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/interview-submissions`, {
        headers: { 'User-ID': userId } // Pass userId in headers
      });

      if (response.data.status === "success") {
        const data = response.data.submissions.filter(sub => sub.userId === userId); // Filter user's submissions
        setSubmissions(data);
        setFilteredSubmissions(data);

        // Extract unique job positions for filtering
        const uniqueJobs = [...new Set(data.map(sub => sub.jobPosition))];
        setJobPositions(uniqueJobs);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("No interview submissions found.");
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleJobChange = (event) => {
    const selected = event.target.value;
    setSelectedJob(selected);
    setFilteredSubmissions(
      selected === "" ? submissions : submissions.filter(sub => sub.jobPosition === selected)
    );
  };

  return (
    <div>
      <Usernavbar1 />
      <div style={{ width: '1000px', margin: '20px auto', backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>Interview Submission History</h1>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Filter by Job Position:</label>
          <select value={selectedJob} onChange={handleJobChange}>
            <option value="">All Positions</option>
            {jobPositions.map((job, index) => (
              <option key={index} value={job}>{job}</option>
            ))}
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Job Position</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Experience Required</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Overall Rating</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Submission Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub, index) => (
              <tr key={sub._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={{ padding: '10px' }}>{sub.jobPosition}</td>
                <td style={{ padding: '10px' }}>{sub.experienceRequired}</td>
                <td style={{ padding: '10px' }}>{sub.overallRating ?? "Not Rated"}</td>
                <td style={{ padding: '10px' }}>{new Date(sub.submissionTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserInterviewHistory;
