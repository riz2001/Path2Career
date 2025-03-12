import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Usernavbar1 from "./Usernavbar1";

function InterviewList() {
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/interviews/weeks")
      .then((res) => setWeeks(res.data))
      .catch((err) => console.error("Error fetching weeks:", err));
  }, []);

  return (
    <div>
      <Usernavbar1 />
      <div className="joblist-container">
        <h2 className="joblist-title">Available Interview Weeks</h2>
        <div className="cards-grid">
          {weeks.length > 0 ? (
            weeks.map((weekObj) => (
              <Link
                to={`/generate-questions/${weekObj.interviewId}`}
                key={weekObj.week}
                className="card"
              >
                <h3 className="card-title">Week {weekObj.week}</h3>
                <button className="start-btn">Start Interview</button>
              </Link>
            ))
          ) : (
            <p className="no-data">No interviews available.</p>
          )}
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }
        body {
          background: #f8f9fa;
        }
        .joblist-container {
          width: 90%;
          max-width: 1200px;
          margin: 30px auto;
          padding: 30px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .joblist-title {
          font-size: 28px;
          font-weight: 600;
          color: #343a40;
          margin-bottom: 20px;
        }
        .cards-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }
        .card {
          width: 280px;
          padding: 20px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          border-radius: 10px;
          text-decoration: none;
          color: #fff;
          transition: all 0.3s ease;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #0056b3, #004080);
        }
        .card-title {
          font-size: 22px;
          font-weight: 500;
          margin-bottom: 15px;
        }
        .start-btn {
          background-color: #ffcc00;
          color: #333;
          padding: 10px 20px;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .start-btn:hover {
          background-color: #ffdb4d;
        }
        .no-data {
          font-size: 18px;
          color: #777;
          margin-top: 20px;
        }
        @media (max-width: 768px) {
          .card {
            width: 220px;
            padding: 15px;
          }
          .joblist-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default InterviewList;
