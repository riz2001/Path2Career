import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';



const Qbtechsubmssions = () => {
  const { week } = useParams(); // Get the week number from the URL
  const [submissions, setSubmissions] = useState([]);
  const [nonSubmittedUsers, setNonSubmittedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [courseYear, setCourseYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [availableCourseYears, setAvailableCourseYears] = useState([
    'First Year A Batch',
    'First Year B Batch',
    'Second Year A Batch',
    'Second Year B Batch',
  ]);
  const [showLateSubmissionsOnly, setShowLateSubmissionsOnly] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/submissions-and-non-submissions/not-mca-mba/${week}?courseYear=${courseYear}&company=${companyFilter}`
        );
        const { submissions, nonSubmittedUsers } = response.data;
        setSubmissions(submissions);
        setNonSubmittedUsers(nonSubmittedUsers);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError('Error fetching submissions');
      }
    };

    fetchSubmissions();
  }, [week, courseYear, companyFilter]);

  const filteredSubmissions = submissions.filter(submission => {
    const user = submission.userId || {};
    const matchesSearchTerm =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.admissionno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearchTerm;
  });

  useEffect(() => {
    setFilteredCount(filteredSubmissions.length);
  }, [filteredSubmissions]);

  const lateSubmissions = filteredSubmissions.filter(submission => {
    return new Date(submission.submissionTime) > new Date(submission.dueDate);
  });

  const filteredNonSubmittedUsers = nonSubmittedUsers.filter(user => {
    const matchesSearchTerm =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.admissionno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const hasNotSubmittedForSelectedCompany = !submissions.some(
      (submission) =>
        submission.userId?._id === user._id &&
        submission.company === companyFilter &&
        submission.week === week
    );

    return matchesSearchTerm && hasNotSubmittedForSelectedCompany;
  });

  const displaySubmissions = showLateSubmissionsOnly ? lateSubmissions : filteredSubmissions;

  const uniqueCompanies = [...new Set(submissions.map(sub => sub.company))];

  return (
    <div>
   

      <div className="submissions-container">
        <h2 className="title">Submissions for Week {week}</h2>

        <div className="filter-section">
          {/* Dropdown for Course Year Selection */}
          <label htmlFor="courseYear">Select Course Year:</label>
          <select
            id="courseYear"
            value={courseYear}
            onChange={(e) => {
              setCourseYear(e.target.value);
              setCompanyFilter('');
            }}
          >
            <option value="">All Course Years</option>
            {availableCourseYears.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <label htmlFor="searchTerm">Search:</label>
          <input
            id="searchTerm"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter name, admission no, or email"
          />

          {/* Dropdown for Company Filtering */}
          <label htmlFor="companyFilter">Filter by Company:</label>
          <select
            id="companyFilter"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="">All Companies</option>
            {uniqueCompanies.map((company, index) => (
              <option key={index} value={company}>
                {company}
              </option>
            ))}
          </select>

          {/* Toggle to Show Only Late Submissions */}
          <label htmlFor="showLateSubmissionsOnly">
            <input
              type="checkbox"
              id="showLateSubmissionsOnly"
              checked={showLateSubmissionsOnly}
              onChange={(e) => setShowLateSubmissionsOnly(e.target.checked)}
            />
            Show Only Late Submissions
          </label>
        </div>

        {/* Displaying Submissions */}
        <br />
        <h3>{showLateSubmissionsOnly ? 'Late Submissions' : 'Users Who Submitted'}</h3>
        <p>{`Number of Submitted Students: ${filteredCount}`}</p>

        {displaySubmissions.length ? (
          <table className="submissions-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>ADMISSION NO</th>
                <th>ROLL NO</th>
                <th>COURSE YEAR</th>
                <th>EMAIL</th>
                <th>COMPANY</th>
                <th>SCORE</th>
                <th>SUBMISSION TIME</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {displaySubmissions.map((submission) => {
                const isLate = new Date(submission.submissionTime) > new Date(submission.dueDate);
                return (
                  <tr key={submission._id}>
                    <td>{submission.userId ? submission.userId.name : 'Unknown User'}</td>
                    <td>{submission.userId ? submission.userId.admissionno : 'N/A'}</td>
                    <td>{submission.userId ? submission.userId.rollno : 'N/A'}</td>
                    <td>{submission.userId ? submission.userId.courseYear : 'N/A'}</td>
                    <td>{submission.userId ? submission.userId.email : 'N/A'}</td>
                    <td>{submission.company || 'N/A'}</td>
                    <td>{submission.score}</td>
                    <td>{new Date(submission.submissionTime).toLocaleString()}</td>
                    <td style={{ color: isLate ? 'red' : 'green' }}>{isLate ? 'Late' : 'On Time'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No submissions available for this week.</p>
        )}
        <br />

        {/* Conditional Rendering for Users Who Did Not Submit */}
        {!showLateSubmissionsOnly && (
          <>
            <h3>Users Who Did Not Submit for {companyFilter} in Week {week}</h3>
            {filteredNonSubmittedUsers.length ? (
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>ADMISSION NO</th>
                    <th>ROLL NO</th>
                    <th>COURSE YEAR</th>
                    <th>EMAIL</th>
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
              <p>All users have submitted the quiz for {companyFilter} in Week {week}.</p>
            )}
          </>
        )}

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
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
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
    background-color: #007bff; /* Blue background for table headers */
    color: white; /* White text color for better contrast */
  }
  .submissions-table td {
    background-color: #f9f9f9; /* Light grey for table cells */
  }
  .title {
    text-align: center;
    margin-bottom: 20px;
  }
`}</style>

      
      </div>
    </div>
  );
};

export default Qbtechsubmssions;
