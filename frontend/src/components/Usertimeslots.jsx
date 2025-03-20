import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Usernavbar1 from './Usernavbar1';

const Usertimeslots = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTimeSlots = async () => {
      const userId = sessionStorage.getItem('userId'); // Get the user ID from session storage

      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/timeslots`);
        setTimeSlots(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching time slots.');
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, []);

  const confirmAttendance = async (slotId) => {
    const userId = sessionStorage.getItem('userId'); // Get the user ID from session storage
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${userId}/timeslots/update/${slotId}`, {
        confirmationStatus: 'confirmed', // Send confirmation status
      });
      // Update the local state with the new time slots data
      setTimeSlots(response.data.timeSlots);
      alert('Attendance confirmed!');
    } catch (err) {
      console.error('Error:', err);
      alert('Error confirming attendance.');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div>
        <Usernavbar1/>
    <div style={styles.container}>
      <h2 style={styles.title}>Your Time Slots</h2>
      {timeSlots.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Time Slot</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Meeting Link</th>
              <th style={styles.th}>Attendance Confirmation</th>
              <th style={styles.th}>Attendance Confirmed</th>
             
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr key={index} style={styles.row}>
                <td style={styles.td}>{slot.timeSlot}</td>
                <td style={styles.td}>{new Date(slot.date).toLocaleDateString()}</td>
                <td style={styles.td}>
               
  {slot.meetingLink ? (
    <a href={slot.meetingLink} target="_blank" rel="noopener noreferrer" style={styles.link}>
      Meeting Link
    </a>
  ) : (
    <span>No meeting link provided</span>
  )}
</td>

                <td style={styles.td}>
                  <button onClick={() => confirmAttendance(slot._id)} style={styles.button}>Confirm</button>
                </td>
                <td style={styles.td}>
                  {slot.confirmationStatus ? slot.confirmationStatus.charAt(0).toUpperCase() + slot.confirmationStatus.slice(1) : 'Not Confirmed'}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={styles.noSlots}>No time slots found.</p>
      )}
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '12px 15px',
    border: '1px solid #ddd',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  td: {
    padding: '12px 15px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
  },
  row: {
    transition: 'background-color 0.2s',
  },
  button: {
    padding: '10px 16px', // Increased padding for larger button
    fontSize: '16px', // Increased font size for better readability
    border: 'none',
    borderRadius: '6px', // Slightly larger border radius
    backgroundColor: '#28a745',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  link: {
    color: '#007BFF',
    textDecoration: 'none',
  },
  loading: {
    textAlign: 'center',
    fontSize: '20px',
    color: '#666',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: '18px',
  },
  noSlots: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#999',
  },
};

export default Usertimeslots;
