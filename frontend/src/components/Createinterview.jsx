import React, { useState } from "react";
import axios from "axios";

function CreateInterview() {
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/create-interview", { jobPosition, jobDesc, jobExperience });
      alert("Interview created successfully!");
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };

  return (
    <div>
      <h2>Create Interview</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Job Position" value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} required />
        <textarea placeholder="Job Description" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} required />
        <input type="number" placeholder="Years of Experience" value={jobExperience} onChange={(e) => setJobExperience(e.target.value)} required />
        <button type="submit">Create Interview</button>
      </form>
    </div>
  );
}

export default CreateInterview;
