import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Adminnavbar from './Adminnavbar';

const Offdelete = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch job submissions from the backend
  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/job-submissionss');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching job submissions:', error);
      setError('Error fetching job submissions');
    }
  };

  // Delete a job submission by ID
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/job-submissionss/${id}`);
      alert('Job submission deleted successfully');
      fetchJobs(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting job submission:', error);
      setError('Error deleting job submission');
    }
  };

  return (
    <div>
        <Adminnavbar/>
      <h2><b></b><center>Delete Jobs</center></h2>
      {error && <p>{error}</p>}
      {jobs.length > 0 ? (
        <table className="job-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Salary</th>
              <th>Location</th>
            
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>{job.companyName}</td>
                <td>{job.salary}</td>
                <td>{job.location}</td>
               
              
                <td>
                  <button
                    onClick={() => handleDelete(job._id)}
                    style={{ backgroundColor: 'red', color: 'white' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No job submissions available.</p>
      )}

      <style jsx>{`
        .job-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .job-table th,
        .job-table td {
          padding: 10px;
          text-align: left;
          border: 1px solid #007bff;
        }

        .job-table th {
          background-color: #007bff;
          color: white;
        }

        .job-table tr:nth-child(even) {
          background-color: #f2f2f2;
        }

        .job-table tr:hover {
          background-color: #e0e7ff;
        }

        button {
          padding: 5px 10px;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Offdelete;
