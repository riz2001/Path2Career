import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Btechnavbar from './Btechnavbar';
import Adminnavbar from './Adminnavbar';


// Styled Components
// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; // Center align items vertically
  padding: 4rem; // Increased padding for better spacing
  background-color: #f8f9fa; // Light background color
  border-radius: 8px; // Rounded corners
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); // Subtle shadow
  margin: 2rem auto; // Center the container horizontally
  max-width: 1700px; // Increased max width for container
  width: 90%; // Full width for smaller screens
`;

const Table = styled.table`
  width: 100%; // Full width
  border-collapse: collapse; // Remove spacing between cells
  background-color: white; // White background for table
  border-radius: 8px; // Rounded corners
  overflow: hidden; // To clip borders
  margin: 0 auto; // Center the table horizontally
  font-size: 1.2rem; // Increased font size for table text

  th, td {
    padding: 20px; // Increased padding inside cells for better spacing
    text-align: center; // Center align text in cells
  }

  th {
    background-color: #007bff; // Header background color
    color: white; // Header text color
  }

  tr:nth-child(even) {
    background-color: #f2f2f2; // Zebra striping for rows
  }
`;


const Title = styled.h2`
  margin-bottom: 2rem;
  color: #333; // Dark color for text
  font-weight: bold;
  text-align: center; // Center title
`;


const Button = styled.button`
  padding: 0.5rem 1rem; // Padding for buttons
  border-radius: 4px; // Rounded corners
  cursor: pointer; // Pointer cursor on hover

  &.delete {
    background-color: #dc3545; // Danger color for delete
    color: white; // White text
    border: none; // No border
    transition: background-color 0.3s; // Smooth transition

    &:hover {
      background-color: #c82333; // Darker red on hover
    }
  }

  &.delete-registrations {
    background-color: #ffc107; // Warning color
    color: white;

    &:hover {
      background-color: #e0a800; // Darker yellow on hover
    }
  }
`;

const Deletej = () => {
    const [jobs, setJobs] = useState([]);
    const [registrations, setRegistrations] = useState([]); // To hold registration details

    // Fetch jobs from the backend
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobResponse = await axios.get("http://localhost:5000/api/jobsss");
                setJobs(jobResponse.data);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };
        fetchJobs();
    }, []);

    // Handle job deletion
    const handleJobDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/jobs/${id}`);
            setJobs(jobs.filter(job => job._id !== id));
            alert("Job successfully deleted"); // Update UI
        } catch (error) {
            console.error("Error deleting job:", error);
        }
    };

    // Handle deletion of all registrations for a job
    const handleDeleteAllRegistrations = async (jobId) => {
        try {
            await axios.delete(`http://localhost:5000/api/registrations/${jobId}`);
            setRegistrations(registrations.filter(reg => reg.job_id !== jobId)); // Update UI
            alert("All registrations for this job have been deleted.");
        } catch (error) {
            console.error("Error deleting registrations:", error);
        }
    };

    return (
        <div>
           <Adminnavbar/>
            <Container>
                <Title>Job Listings</Title>
                <Table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Salary</th>
                            <th>Delete Job</th> {/* Column for delete job button */}
                            <th>Delete All Registrations</th> {/* Column for delete registrations button */}
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job) => (
                            <tr key={job._id}>
                                <td>{job.title}</td>
                                <td>{job.description}</td>
                                <td>{job.location}</td>
                                <td>{job.salary}</td>
                                <td>
                                    <Button className="delete" onClick={() => handleJobDelete(job._id)}>
                                        Delete Job
                                    </Button>
                                </td>
                                <td>
                                    <Button className="delete-registrations" onClick={() => handleDeleteAllRegistrations(job._id)}>
                                        Delete All Registrations
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </div>
    );
};

export default Deletej;
