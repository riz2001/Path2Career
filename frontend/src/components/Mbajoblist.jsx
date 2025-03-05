import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Mbanavbar from './Mbanavbar';



const Mbajoblist = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/jobs')
      .then(response => {
        if (response.data.status === 'success') {
          setJobs(response.data.jobs);
        } else {
          alert('Error fetching jobs');
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}/mbaregistrations`);
  };

  return (
    <div>
   <Mbanavbar/>
      <br />
      <div className="job-list">
        <h2 className="title">Available Jobs</h2>
        <div className="card-container">
          {jobs.map(job => (
            <div key={job._id} className="card" onClick={() => handleJobClick(job._id)} style={{ cursor: 'pointer' }}>
              <h3 className="card-title">{job.title}</h3>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        /* Apply background color to the entire page */
        body {
          background-color: #f0f2f5; /* Light gray background for the whole page */
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }

        .job-list {
          width: 80%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background-color: #ffffff; /* White background for the content area */
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
          background-color: #0056b3; /* Darker blue on hover */
        }

        .card-title {
          font-size: 18px;
          color: #fff; /* White text for better readability */
          text-decoration: none; /* Remove default underline */
          transition: text-decoration 0.2s ease; /* Smooth transition for underline */
        }

        .card-title:hover {
          text-decoration: underline; /* Add underline on hover */
          text-decoration-color: white; /* Set underline color to white */
        }
      `}</style>
    </div>
  );
};

export default Mbajoblist;
