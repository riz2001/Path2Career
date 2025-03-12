import React from 'react';
import axios from 'axios';

import Btechnavbar from './Btechnavbar';

const Btechupdation = () => {
  const handleUpdateCourseYear = async () => {
    const confirmed = window.confirm('Are you sure you want to update the course years for BTech students?');
    if (!confirmed) return;

    try {
      const response = await axios.post('http://localhost:5000/api/btechupdateCourseYear');
      if (response.status === 200) {
        alert('BTech course years updated successfully!');
      } else {
        alert('Failed to update course years.');
      }
    } catch (error) {
      console.error('Error updating BTech course years:', error);
      alert('An error occurred while updating course years.');
    }
  };

  const handleDeleteStudents = async () => {
    const confirmed = window.confirm('Are you sure you want to delete Fourth Year BTech students?');
    if (!confirmed) return;

    try {
      const response = await axios.delete('http://localhost:5000/api/btechdeleteStudents');
      if (response.status === 200) {
        alert('Fourth Year BTech students have been deleted successfully!');
      } else {
        alert('Failed to delete students.');
      }
    } catch (error) {
      console.error('Error deleting BTech students:', error);
      alert('An error occurred while deleting students.');
    }
  };

  return (
    <div>
      <Btechnavbar/>
      <div style={styles.container}>
        <h2 style={styles.title}>BTECH DATABASE MANAGEMENT</h2>
        
        {/* Delete Students Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Delete Fourth Year Students</h3>
          <p style={styles.cardDescription}>⚠️ This action will delete all Fourth Year BTech students.</p>
          <button onClick={handleDeleteStudents} style={{ ...styles.button, backgroundColor: '#dc3545' }}>
            Delete Fourth Year Students
          </button>
        </div>

        {/* Update Course Year Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Update Course Year</h3>
          <p style={styles.cardDescription}>⚠️ This action will promote First Year to Second Year, Second Year to Third Year, and Third Year to Fourth Year.</p>
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

export default Btechupdation;
