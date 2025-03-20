import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Mcanavbar from "./Mcaanavbar";

const Jobposition = () => {
  const [weeks, setWeeks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/interviewweeks") // Fetch weeks from backend
      .then((res) => res.json())
      .then((data) => setWeeks(data))
      .catch((err) => console.error("Error fetching weeks:", err));
  }, []);

  const handleWeekClick = (week) => {
    navigate(`/mcasubmissions/${week}`); // Navigate to corresponding interview ID
  };

  return (
    <div>
      <Mcanavbar />
      <div className="week-review">
        <h1 className="title">Registered Weeks</h1>
        <div className="card-container">
          {weeks.map((week, index) => (
            <div key={index} className="card" onClick={() => handleWeekClick(week)}>
              <h3 className="card-title">Week {week}</h3>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        body {
          background-color: #f0f2f5; /* Page background */
          margin: 0;
          font-family: Arial, sans-serif;
        }
        .week-review {
          width: 80%;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .title {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }
        .card-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .card {
          background-color: #007bff;
          border: 1px solid #0056b3;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          width: calc(30% - 20px);
          margin: 10px;
          padding: 15px;
          color: #fff;
          transition: transform 0.2s ease;
          text-align: center;
          cursor: pointer;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        .card-title {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default Jobposition;
