import React, { useEffect, useState } from "react";
import axios from "axios";
import Usernavbar1 from "./Usernavbar1";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Prediction() {
  const userId = sessionStorage.getItem("userId");
  const [scores, setScores] = useState({ quizScore: null, compilerScore: null, interviewScore: null });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        if (!userId) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/combined-score/${userId}`);
        setScores(response.data);

        const weeklyResponse = await axios.get(`http://localhost:5000/api/weekly-scores/${userId}`);
        setWeeklyData(weeklyResponse.data);
      } catch (err) {
        setError("Error fetching scores");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [userId]);

  const chartData = {
    labels: Object.keys(weeklyData).map((week) => `Week ${week}`),
    datasets: [
      {
        label: "Overall Average",
        data: Object.values(weeklyData).map((data) => parseFloat(data.overallAverage)),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const allScoresAreNull = scores.quizScore === null && scores.compilerScore === null && scores.interviewScore === null;

  const averageScore = allScoresAreNull
    ? 0
    : ((scores.quizScore || 0) + (scores.compilerScore || 0) + (scores.interviewScore || 0)) / 3;

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div>
      <Usernavbar1 />
      <div className="container">
        <div className="score-card">
          <h2>Performance Scores</h2>
          <div className="score-details">
            <div className="score-box">
              Aptitude: {scores.quizScore > 0 ? `${scores.quizScore}%` : <span className="not-attended">Not Attended ❌</span>}
            </div>
            <div className="score-box">
              Code: {scores.compilerScore > 0 ? `${scores.compilerScore}%` : <span className="not-attended">Not Attended </span>}
            </div>
            <div className="score-box">
              Interview: {scores.interviewScore > 0 ? `${scores.interviewScore}%` : <span className="not-attended">Not Attended </span>}
            </div>
          </div>

          <div className="average-box">
            {scores.quizScore === 0 && scores.compilerScore === 0 && scores.interviewScore === 0 ? (
              <span className="not-attended">Didn't attend any test ❌</span>
            ) : (
              `Average Score: ${averageScore.toFixed(2)}%`
            )}
          </div>

          {averageScore > 0 && (
            <div className="improve-message">
              {(() => {
                const improvementAreas = [];
                if (scores.quizScore > 0 && scores.quizScore < 70) {
                  improvementAreas.push("Aptitude");
                }
                if (scores.compilerScore > 0 && scores.compilerScore < 70) {
                  improvementAreas.push("Coding");
                }
                if (scores.interviewScore > 0 && scores.interviewScore < 70) {
                  improvementAreas.push("Interview");
                }
                if (improvementAreas.length === 0) {
                  return <p>Excellent performance in all attended tests! 🎯🔥</p>;
                } else {
                  return <p>You need to improve in {improvementAreas.join(", ")}.</p>;
                }
              })()}
            </div>
          )}
        </div>

        <div className="chart-container">
          <h3>Weekly Performance Analysis</h3>
          <Line data={chartData} />
        </div>

        <style jsx>{`
          .not-attended {
            color: gray;
            font-style: italic;
          }
          .score-box {
            padding: 20px 40px;
            background-color: #e3f2fd;
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
          }
          .average-box {
            margin-top: 20px;
            padding: 15px 40px;
            background-color: #d1f7c4;
            border-radius: 10px;
            font-size: 22px;
            font-weight: bold;
            color: #333;
          }
          .improve-message {
            margin-top: 15px;
            font-size: 18px;
            color: #555;
          }
        `}</style>

        <style jsx>{`
          .container {
            font-family: "Poppins", sans-serif;
            background-color: #f5f7fa;
            padding: 20px 0;
          }
          .score-card {
            background: #fff;
            width: 80%;
            margin: 0 auto;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
            margin-bottom: 30px;
          }
          h2 {
            color: #333;
            margin-bottom: 20px;
          }
          .score-details {
            display: flex;
            justify-content: space-around;
            padding: 20px 0;
          }
          .score-box {
            padding: 20px 40px;
            background-color: #e3f2fd;
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
          }
          .average-box {
            margin-top: 20px;
            padding: 15px 40px;
            background-color: #d1f7c4;
            border-radius: 10px;
            font-size: 22px;
            font-weight: bold;
            color: #333;
          }
          .improve-message {\n            margin-top: 15px;\n            color: red;\n            font-weight: bold;\n          }\n          .chart-container {\n            width: 80%;\n            margin: 0 auto;\n            background: #fff;\n            padding: 20px;\n            border-radius: 15px;\n            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);\n          }\n          .loading {\n            text-align: center;\n            font-size: 20px;\n            margin-top: 50px;\n          }\n          .error {\n            text-align: center;\n            font-size: 20px;\n            color: red;\n            margin-top: 50px;\n          }\n        `}</style>
      </div>
    </div>
  );
}

export default Prediction;
