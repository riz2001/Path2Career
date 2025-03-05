import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Mbainterviewsubmission = () => {
  const { jobPosition } = useParams();
  
  const [submissions, setSubmissions] = useState([]);
  const [nonSubmittedUsers, setNonSubmittedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseYear, setCourseYear] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/mba-jobsubmissions-and-non-submissions/${jobPosition}`
        );
        const { submissions, nonSubmittedUsers } = response.data;
        setSubmissions(submissions);
        setNonSubmittedUsers(nonSubmittedUsers);
      } catch (err) {
        console.error("Error fetching job submissions:", err);
        setError("Error fetching job submissions");
      }
    };
    fetchData();
  }, [jobPosition]);

  // Course Year Options
  const courseYearOptions = [
    "First Year A Batch",
    "First Year B Batch",
    "Second Year A Batch",
    "Second Year B Batch"
  ];

  // Filtering Submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const user = submission.userId || {};
    return (
      (!courseYear || user.courseYear === courseYear) &&
      ((user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.rollNumber && user.rollNumber.toString().includes(searchTerm)) ||
        (user.admissionNumber && user.admissionNumber.toString().includes(searchTerm)))
    );
  });

  // Filtering Non-Submitted Users
  const filteredNonSubmittedUsers = nonSubmittedUsers.filter((user) => {
    return (
      (!courseYear || user.courseYear === courseYear) &&
      ((user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.rollNumber && user.rollNumber.toString().includes(searchTerm)) ||
        (user.admissionNumber && user.admissionNumber.toString().includes(searchTerm)))
    );
  });

  return (
    <div className="submissions-container">
      <h2 className="title">Job Submissions for {jobPosition}</h2>

      {/* Filters */}
      <div className="filter-section">
        <div className="input-group">
          <label htmlFor="searchTerm">Search:</label>
          <input
            id="searchTerm"
            type="text"
            placeholder="Enter name, email, roll no, or admission no"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="courseYear">Filter by Course Year:</label>
          <select
            id="courseYear"
            value={courseYear}
            onChange={(e) => setCourseYear(e.target.value)}
          >
            <option value="">All</option>
            {courseYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Submissions Table */}
      <h3>Submissions</h3>
      {filteredSubmissions.length ? (
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Admission No</th>
              <th>Roll No</th>
           
              <th>Course Year</th>
              <th>Email</th>
              <th>Overall Rating</th>
              <th>Submission Date</th>
            
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((submission) => (
              <tr key={submission._id}>
                <td>{submission.userId ? submission.userId.name : "Unknown"}</td>
              
               
                <td>{submission.userId ? submission.userId.rollno : "N/A"}</td>
                <td>{submission.userId ? submission.userId.admissionno : "N/A"}</td>
                <td>{submission.userId ? submission.userId.courseYear : "N/A"}</td>

                <td>{submission.userId ? submission.userId.email : "N/A"}</td>
                <td>{submission.overallRating != null ? submission.overallRating : "Pending"}</td>
                <td>{new Date(submission.submissionTime).toLocaleString()}</td>
             
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No submissions available for this job position.</p>
      )}

      {/* Non-Submitted Users Table */}
      <h3>Users Who Have Not Submitted</h3>
      {filteredNonSubmittedUsers.length ? (
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Username</th>
        
              <th>Admission No</th>
              <th>Roll No</th>
              <th>Course Year</th>
              <th>Email</th>
          
            </tr>
          </thead>
          <tbody>
            {filteredNonSubmittedUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.admissionno}</td>
                <td>{user.rollno}</td>
                <td>{user.courseYear}</td>
                <td>{user.email}</td>
           
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>All eligible users have submitted for this job position.</p>
      )}

      {/* Inline CSS Styling */}
      <style jsx>{`
        .submissions-container {
          width: 80%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .filter-section {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
        }
        .input-group label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .input-group input,
        .input-group select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .submissions-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .submissions-table th,
        .submissions-table td {
          padding: 10px;
          text-align: left;
          border: 1px solid #dddddd;
        }
        .submissions-table th {
          background-color: #007bff;
          color: white;
        }
        .submissions-table td {
          background-color: #f9f9f9;
        }
        .title {
          text-align: center;
          margin-bottom: 20px;
        }
        .error {
          color: red;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Mbainterviewsubmission;
