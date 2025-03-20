import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Mcanavbar from './Mcaanavbar';

const Weekcompilers = () => {
  const [weeks, setWeeks] = useState([]);
  const [error, setError] = useState(null);

  // Fetch weeks from the backend when the component mounts
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/compilerSubmissionss');
        const weeksArray = Object.keys(res.data).map((week) => ({
          week: parseInt(week),
          submissions: res.data[week],
        }));
        setWeeks(weeksArray);
      } catch (err) {
        setError('Error fetching submissions');
      }
    };

    fetchWeeks();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <Mcanavbar />
      <br />
      <div className="main-page">
        <h2 className="title">All Weeks Coding Submissions</h2>
        <div className="card-container">
          {weeks.length === 0 ? (
            <p>No submissions found.</p>
          ) : (
            weeks.map(({ week, submissions }) => (
              <div key={week} className="card">
                <Link to={`/mcasubmissions/week/${week}`} className="card-link">
                  <h3 className="card-title">Week {week}</h3>
                </Link>
           
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        body {
          background-color: #f0f2f5;
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .main-page {
          width: 80%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .title {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
        }
        .card-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }
       .card {
          background-color: #007bff; /* Custom blue background for the cards */
          border: 1px solid #0056b3; /* Darker blue border for contrast */
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          width: 200px;
          text-align: center;
          padding: 15px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          color: #fff; /* White text for better readability */
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          background-color: #0056b3;
        }
        .card-link {
          text-decoration: none;
          color: #ffffff;
        }
        .card-link:hover {
          text-decoration: underline;
        }
        .card-title {
          font-size: 18px;
          margin: 0;
          color: #fff;
        }
        .submission-count {
          font-size: 16px;
          margin-top: 10px;
          color: #fff;
        }
        .error {
          text-align: center;
          font-size: 18px;
          color: #ff0000;
        }
      `}</style>
    </div>
  );
};

export default Weekcompilers;
