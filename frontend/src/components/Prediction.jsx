import React, { useEffect, useState } from "react";
import axios from "axios";
import Usernavbar1 from "./Usernavbar1";

function Prediction() {
  const userId = sessionStorage.getItem("userId");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndPredict = async () => {
      try {
        if (!userId) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        // Fetch scores from the backend
        const response = await axios.get(`http://localhost:5000/api/combined-score/${userId}`);
        const scores = response.data;

        // Send scores to the backend for prediction
        const predictResponse = await axios.post("http://127.0.0.1:5000/app", {
          aptitude: scores.quizScore, // Use quizScore as aptitude
          code: scores.compilerScore, // Use compilerScore as code
          interview: scores.interviewScore, // Use interviewScore as interview
        });

        setPrediction(predictResponse.data.recommendation);
      } catch (err) {
        setError("Error fetching scores or making prediction");
      } finally {
        setLoading(false);
      }
    };

    fetchAndPredict();
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div><Usernavbar1/>
    <div className="prediction-container">
      <h2>Performance Recommendation</h2>

      {prediction && (
        <div className="prediction-result">
          <h3>Recommendation:</h3>
          <p>{prediction}</p>
        </div>
      )}

      <style jsx>{`
        .prediction-container {
          width: 50%;
          max-width: 500px;
          margin: 20px auto;
          padding: 20px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-family: "Poppins", sans-serif;
        }
        h2 {
          margin-bottom: 20px;
          color: #333;
        }
        .prediction-result {
          margin-top: 20px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .prediction-result h3 {
          margin-bottom: 10px;
          color: #28a745;
        }
        .prediction-result p {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
      `}</style>
    </div>
    </div>
  );
}

export default Prediction;
