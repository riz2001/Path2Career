import React, { useState } from 'react';
import axios from 'axios';
import AdminLogin from './Adminlogin';
import Adminnavbar from './Adminnavbar';



const Addoffcampus = () => {
  const [companyName, setCompanyName] = useState('');
  const [salary, setSalary] = useState('');
  const [image, setImage] = useState(null);
  const [applicationLink, setApplicationLink] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('salary', salary);
    formData.append('image', image);
    formData.append('applicationLink', applicationLink);
    formData.append('location', location);

    try {
      const response = await axios.post('http://localhost:5000/api/offcampussubmit-form', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Form submitted successfully!');
      alert('Form submitted successfully!');
    } catch (error) {
      setMessage('Error submitting the form.');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <Adminnavbar/>
    <div style={styles.container}>
      <h2 style={styles.heading}>Submit Job Information</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Salary</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Application Link</label>
          <input
            type="url"
            value={applicationLink}
            onChange={(e) => setApplicationLink(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Job Poster</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            style={styles.input}
            required
          />
        </div>
        <button type="submit" style={styles.button}>Submit</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
    </div>
  );
};

const styles = {
  container: {
    width: '50%',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '16px',
    marginBottom: '5px',
    color: '#555',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    fontSize: '18px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  message: {
    textAlign: 'center',
    color: '#28a745',
    marginTop: '20px',
  },
};

export default Addoffcampus;
