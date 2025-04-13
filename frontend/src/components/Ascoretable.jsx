// src/components/ScoreTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Mcanavbar from './Mcaanavbar';


const MbascoreTable = () => {
  const [weekRanges, setWeekRanges] = useState([]); // State to store week ranges
  const [selectedWeeks, setSelectedWeeks] = useState(''); // State to track selected weeks
  const [scores, setScores] = useState([]); // State to store scores

  // Fetch week ranges from the backend on component mount
  useEffect(() => {
    const fetchWeekRanges = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/week-ranges');
        setWeekRanges(response.data); // Update state with fetched week ranges
      } catch (error) {
        console.error('Error fetching week ranges:', error);
      }
    };

    fetchWeekRanges();
  }, []);

  // Handle week selection from dropdown
  const handleWeekSelection = async (e) => {
    const range = e.target.value;
    setSelectedWeeks(range); // Update selected weeks state

    // Extracting the week numbers from the selected range
    const weeks = range.match(/\d+/g);
    const startWeek = weeks ? parseInt(weeks[0]) : 1;
    const endWeek = weeks ? parseInt(weeks[1]) : 4;

    try {
      const response = await axios.get(`http://localhost:5000/api/mbascoresss/${startWeek}/${endWeek}`);
      setScores(response.data); // Update scores state with fetched data
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  // Function to find the highest score
  const findHighestScore = () => {
    return scores.reduce((max, user) => (user.score > max ? user.score : max), 0);
  };

  // Sort scores in descending order
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const highestScore = findHighestScore();

  return (
    <div>
        <Mcanavbar/>
  
    <div className="score-table-container">
      <h2 className="header">Score Table</h2>
      <label htmlFor="weekRanges">Select Weeks:</label>
      <select id="weekRanges" value={selectedWeeks} onChange={handleWeekSelection}>
        <option value="">--Select Weeks--</option>
        {weekRanges.map((range, index) => (
          <option key={index} value={range}>{range}</option>
        ))}
      </select>

      <table className="score-table">
        <thead>
          <tr>
            <th>SL No</th>
            <th>User</th>
            <th>Admission No</th>
            <th>Roll No</th>
            <th>Course Year</th>
            <th>Email</th>
            <th>Score</th>
            <th>Status</th> {/* New Status Column */}
          </tr>
        </thead>
        <tbody>
          {sortedScores.map((score, index) => (
            <tr
              key={index}
              className={score.score === highestScore ? 'highlight' : ''}
            >
              <td>{index + 1}</td> {/* Serial Number */}
              <td>{score.user.name}</td>
              <td>{score.user.admissionno}</td>
              <td>{score.user.rollno}</td>
              <td>{score.user.courseYear}</td>
              <td>{score.user.email}</td>
              <td>{score.score}</td>
              <td>{score.score === highestScore ? 'Topper' : ''}</td> {/* Topper Status */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Inline CSS */}
      <style jsx>{`
        .score-table-container {
          max-width: 1000px; /* Increase max width for larger table */
          margin: 0 auto; /* Center the table horizontally */
          padding: 30px; /* Increased padding around the container */
          background-color: #ffffff; /* White background for the card effect */
          border-radius: 12px; /* Rounded corners */
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* Subtle shadow */
        }

        .header {
          text-align: center; /* Center align the heading */
          color: #4CAF50; /* Green color for the heading */
          margin-bottom: 20px; /* Space below the heading */
          font-size: 28px; /* Increase heading font size */
        }

        label {
          font-weight: bold; /* Bold label */
          margin-right: 10px; /* Space between label and dropdown */
        }

        select {
          padding: 10px; /* Increase padding for the dropdown */
          margin-bottom: 20px; /* Space below dropdown */
          border-radius: 4px; /* Rounded corners */
          border: 1px solid #ccc; /* Border color */
          font-size: 16px; /* Increase font size */
        }

        .score-table {
          width: 100%; /* Full width of the container */
          border-collapse: collapse; /* Remove double borders */
          margin-top: 20px; /* Space above the table */
        }

        th, td {
          padding: 20px; /* Increase padding inside table cells */
          text-align: left; /* Left align text */
          border: 1px solid #ddd; /* Border color */
          font-size: 18px; /* Increase font size for table cells */
        }

        th {
          background-color: #007bff; /* Header background color */
          color: #ffffff; /* Header text color */
        }

        tr:nth-child(even) {
          background-color: #f9f9f9; /* Zebra stripe for even rows */
        }

        .highlight {
          font-weight: bold; /* Bold text for highest score */
          background-color: #ffeb3b; /* Highlight color */
        }

        .error {
          color: #ff0000; /* Red color for error messages */
        }
      `}</style>
    </div>
    </div>
  );
};

export default MbascoreTable;
