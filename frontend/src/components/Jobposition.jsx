import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router for navigation

const JobPositionsPage = () => {
  const [jobPositions, setJobPositions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/job-positions") // Adjust the backend URL
      .then((res) => res.json())
      .then((data) => setJobPositions(data))
      .catch((err) => console.error("Error fetching job positions:", err));
  }, []);
  
  const handlePositionClick = (position) => {
    navigate(`/mcasubmissions/${position}`); // Redirect to submissions page
  };

  return (
    <div>
      <h2>Job Positions</h2>
      <ul>
        {jobPositions.map((position, index) => (
          <li key={index}>
            <button onClick={() => handlePositionClick(position)}>
              {position}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobPositionsPage;
