import React, { useState } from "react";
import axios from "axios";
import Adminnavbar from "./Adminnavbar";


function CreateInterview() {
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [week, setWeek] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/create-interview", { 
        jobPosition, 
        jobDesc, 
        jobExperience, 
        dueDate,
        week,
      });
      alert("Interview created successfully!");
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };

  return (
    <div>
      <Adminnavbar/>
  
    <div className="interview-container">
      <div className="intro-card">
        <h2 className="title">Create Interview</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Job Position" 
            value={jobPosition} 
            onChange={(e) => setJobPosition(e.target.value)} 
            required 
          />
          <textarea 
            placeholder="Job Description" 
            value={jobDesc} 
            onChange={(e) => setJobDesc(e.target.value)} 
            required 
          />
         
          <input 
            type="date" 
            placeholder="Due Date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            required 
          />
          <input 
            type="number" 
            placeholder="Week" 
            value={week} 
            onChange={(e) => setWeek(e.target.value)} 
            required 
          />
          <button type="submit" className="submit-btn">Create Interview</button>
        </form>
      </div>
      </div>
      
      <style jsx>{`
        .interview-container {
          width: 90%;
          max-width: 600px;
          margin: 30px auto;
          padding: 20px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-family: "Poppins", sans-serif;
        }
        .intro-card {
          padding: 20px;
          border-radius: 8px;
          background: #f7f7f7;
        }
        .title {
          color: #333;
          margin-bottom: 20px;
          font-size: 24px;
        }
        form input,
        form textarea {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        form textarea {
          resize: vertical;
          height: 100px;
        }
        .submit-btn {
          background-color: #007bff;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s ease;
        }
        .submit-btn:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
}

export default CreateInterview;
