import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function InterviewList() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/interviews").then((res) => setInterviews(res.data));
  }, []);

  return (
    <div>
      <h2>All Interviews</h2>
      <ul>
        {interviews.map((interview) => (
          <li key={interview._id}>
            <Link to={`/generate-questions/${interview._id}`}>{interview.jobPosition}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InterviewList;
