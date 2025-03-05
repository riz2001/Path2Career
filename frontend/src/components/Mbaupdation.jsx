import React from 'react';
import axios from 'axios';
import Mbanavbar from './Mbanavbar';

const Mbaupdation = () => {
  const handleUpdateCourseYear = async () => {
    const confirmed = window.confirm('Are you sure you want to update the course years for students?');
    if (!confirmed) return;

    try {
      const response = await axios.post('http://localhost:5000/api/mbaupdateCourseYear'); // Adjust the API endpoint as needed
      if (response.status === 200) {
        alert('Course years updated successfully!');
      } else {
        alert('Failed to update course years.');
      }
    } catch (error) {
      console.error('Error updating course years:', error);
      alert('An error occurred while updating course years.');
    }
  };

  const handleDeleteStudents = async () => {
    const confirmed = window.confirm('Are you sure you want to delete students in Second Year A and B?');
    if (!confirmed) return;

    try {
      const response = await axios.delete('http://localhost:5000/api/mbadeleteStudents'); // Adjust the API endpoint as needed
      if (response.status === 200) {
        alert('Students in Second Year A and B have been deleted successfully!');
      } else {
        alert('Failed to delete students.');
      }
    } catch (error) {
      console.error('Error deleting students:', error);
      alert('An error occurred while deleting students.');
    }
  };

  return (
    <div>
      <Mbanavbar/>
      <div style={styles.container}>
        <h2 style={styles.title}>DATABASE MANAGEMENT</h2>
        {/* Delete Students Card first */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Delete Students</h3>
          <p style={styles.cardDescription}>⚠️ This action will delete students in Second Year A and B.</p>
          <button onClick={handleDeleteStudents} style={{ ...styles.button, backgroundColor: '#dc3545' }}>
            Delete Second Year A & B Students
          </button>
        </div>
        {/* Update Course Year Card second */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Update Course Year</h3>
          <p style={styles.cardDescription}>⚠️ This action will update the course year for First year as Second year students.</p>
          <button onClick={handleUpdateCourseYear} style={styles.button}>
            Update Course Years
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS Styles
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    textAlign: 'center',
    fontSize: '28px',
    marginBottom: '20px',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    margin: '15px 0',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: '24px',
    marginBottom: '10px',
    color: '#007BFF',
  },
  cardDescription: {
    marginBottom: '10px',
    color: '#555',
  },
  button: {
    padding: '10px 16px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#28a745',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default Mbaupdation;
