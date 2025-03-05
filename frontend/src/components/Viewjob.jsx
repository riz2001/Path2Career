import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Usernavbar1 from './Usernavbar1';


// Styled Components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`;

const TableHeader = styled.th`
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  text-align: left;
`;

const TableData = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
`;

const RegisterButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }

  &:disabled {
    background-color: #c3e6cb;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  font-size: 1rem;
`;

const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [registeredJobs, setRegisteredJobs] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.post('http://localhost:5000/ViewAllJob');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to fetch jobs. Please try again.');
      }
    };

    const fetchRegisteredJobs = async () => {
      const userId = sessionStorage.getItem('userId');
      console.log('Logged in User ID:', userId);

      // Fetch user ID from session storage
      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }

      try {
        // Fetch the registered jobs for the specific user
        const response = await axios.get(`http://localhost:5000/ViewRegistrationss/${userId}`);
        const registeredJobIds = new Set(response.data.registrations.map((reg) => reg.job_id._id));
        setRegisteredJobs(registeredJobIds);
      } catch (error) {
        console.error('Error fetching registered jobs:', error);
        setError('Failed to fetch registered jobs. Please try again.');
      }
    };

    fetchJobs();
    fetchRegisteredJobs();
  }, []);

  const handleRegister = async (jobId) => {
    const userId = sessionStorage.getItem('userId'); // Fetch user ID from session storage
    const courseYear = sessionStorage.getItem('courseYear'); // Fetch course year from session storage

    if (!userId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    // Prevent registration based on course year
    if (courseYear === 'First Year A Batch' || courseYear === 'First Year B Batch') {
      alert('First Year A and First Year B are not allowed to register for the quiz.')
      setError('First Year A and First Year B are not allowed to register for the quiz.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/RegisterJob', 
        { user_id: userId, job_id: jobId } // Send user_id and job_id in the request body
      );

      if (response.data.status === 'success') {
        alert('Registered successfully!');
        setRegisteredJobs((prev) => new Set(prev.add(jobId)));
      } else if (response.data.status === 'already registered') {
        alert('You are already registered for this job.');
      } else {
        alert('Error registering for job');
      }
    } catch (error) {
      console.error('Error registering job:', error);
      setError('An error occurred while registering. Please try again.');
    }
  };

  return (

    <div>
        <Usernavbar1/>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Table>
        <thead>
          <tr>
            <TableHeader>Title</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Location</TableHeader>
            <TableHeader>Salary</TableHeader>
            <TableHeader>Register</TableHeader>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id} style={{ backgroundColor: registeredJobs.has(job._id) ? '#d4edda' : 'white' }}>
              <TableData>{job.title}</TableData>
              <TableData>{job.description}</TableData>
              <TableData>{job.location}</TableData>
              <TableData>{job.salary}</TableData>
              <TableData>
                <RegisterButton
                  onClick={() => handleRegister(job._id)}
                  disabled={registeredJobs.has(job._id)} // Correctly disable if registered
                >
                  {registeredJobs.has(job._id) ? 'Registered' : 'Register'}
                </RegisterButton>
              </TableData>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ViewJobs;
