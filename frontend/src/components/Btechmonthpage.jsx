import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import axios from 'axios'; // Import axios
import Adminnavbar from './Adminnavbar';

// CSS Styles
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  monthButton: {
    padding: '10px',
    margin: '5px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  filterContainer: {
    marginTop: '20px',
  },
  filterSelect: {
    padding: '10px',
    marginRight: '10px',
    borderRadius: '5px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '20px',
    backgroundColor: '#f9f9f9',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ddd',
    padding: '10px',
  },
  courseYear: {
    width: '150px', // Adjust the width as needed
  },
  statusButton: {
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
    marginRight: '10px',
  },
  notAttendedButton: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
    marginRight: '10px',
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#ffc107',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  },
};

// Array of month names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Available course years
const courseYears = ['First Year A Batch', 'First Year B Batch', 'Second Year A Batch', 'Second Year B Batch'];

const BtechMonthPage = () => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [selectedCourseYear, setSelectedCourseYear] = useState('');
  const [sortCriteria, setSortCriteria] = useState('date'); // New state for sorting criteria

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/btechmonths');
        setMonths(response.data);
      } catch (error) {
        console.error('Error fetching months:', error);
      }
    };

    fetchMonths();
  }, []);

  const fetchTimeSlots = async (month) => {
    setSelectedMonth(month);
    try {
      const response = await axios.get(`http://localhost:5000/api/timeslots/${month}`);
      setTimeSlots(response.data);
      setFilteredSlots(response.data); // Initialize filtered slots
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const updateStatus = (userId, slotId, status) => {
    setFilteredSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot._id === slotId ? { ...slot, status } : slot
      )
    );

    axios.post('http://localhost:5000/api/updatestatus', { userId, slotId, status })
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        console.error(`Error updating status to ${status}:`, error);
        alert(error.response?.data?.message || `Error updating status to ${status}`);
      });
  };

  // Function to delete a slot
  const deleteSlot = (userId, slotId) => {
    axios.delete(`http://localhost:5000/api/users/${userId}/timeslots/${slotId}`)
      .then((response) => {
        setFilteredSlots((prevSlots) => prevSlots.filter(slot => slot._id !== slotId));
        alert(response.data.message);
      })
      .catch((error) => {
        console.error('Error deleting slot:', error);
        alert(error.response?.data?.message || 'Error deleting slot');
      });
  };

  // Function to get the full month name and year
  const getFormattedMonthYear = (month) => {
    const [year, monthNumber] = month.split('-').map(Number);
    return `${monthNames[monthNumber - 1]} ${year}`; // monthNumber - 1 to get the correct index
  };

  // Function to filter slots by course year
  const handleCourseYearChange = (event) => {
    const selectedYear = event.target.value;
    setSelectedCourseYear(selectedYear);

    // Filter and sort slots
    const filtered = timeSlots.filter(slot => 
      selectedYear === '' || slot.courseYear === selectedYear
    );

    setFilteredSlots(filtered);
  };

  // Function to handle sorting change
  const handleSortChange = (event) => {
    const selectedSort = event.target.value;
    setSortCriteria(selectedSort);

    // Sort the filtered slots based on the selected criteria
    const sortedSlots = [...filteredSlots].sort((a, b) => {
      if (selectedSort === 'date') {
        return new Date(a.date) - new Date(b.date); // Sort by date
      } else if (selectedSort === 'rollno') {
        return a.rollno.localeCompare(b.rollno); // Sort by roll number
      }
      return 0;
    });

    setFilteredSlots(sortedSlots);
  };

  return (
    <div>
        <Adminnavbar/>
   
    <div style={styles.container}>
    <h2 style={{ textAlign: 'center' }}>VIEW SLOTS</h2> {/* Added heading here */}
      <h2>Select a Month</h2>
   
      <div>
        {months.map((month) => (
          <button key={month} style={styles.monthButton} onClick={() => fetchTimeSlots(month)}>
            {getFormattedMonthYear(month)}
          </button>
        ))}
      </div>

      {selectedMonth && (
        <div>
          <h3>Time Slots for {getFormattedMonthYear(selectedMonth)}</h3>
          <div style={styles.filterContainer}>
            <label htmlFor="courseYear" style={{ marginRight: '10px' }}>Filter by Course Year:</label>
            <select
              id="courseYear"
              style={styles.filterSelect}
              value={selectedCourseYear}
              onChange={handleCourseYearChange}
            >
              <option value="">All</option>
              {courseYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <label htmlFor="sortCriteria" style={{ marginRight: '10px' }}>Sort by:</label>
            <select
              id="sortCriteria"
              style={styles.filterSelect}
              value={sortCriteria}
              onChange={handleSortChange}
            >
              <option value="date">Date</option>
              <option value="rollno">Roll Number</option>
            </select>
          </div>

          <div style={styles.card}>
            {filteredSlots.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Roll No</th>
                    <th style={styles.th}>Name</th>
                    <th style={{ ...styles.th, ...styles.courseYear }}>Course Year</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Admission No</th>
                    <th style={styles.th}>Time Slot</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Meeting Link</th>
                    <th style={styles.th}>Confirmation Status</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action - Mark as Attended</th>
                    <th style={styles.th}>Action - Mark as Not Attended</th>
                    <th style={styles.th}>Action - Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot) => (
                    <tr key={slot._id}>
                       <td style={styles.td}>{slot.rollno}</td>
                      <td style={styles.td}>{slot.name}</td>
                      <td style={styles.td}>{slot.courseYear}</td>
                      <td style={styles.td}>{slot.email}</td>
                      <td style={styles.td}>{slot.admissionno}</td>
                      <td style={styles.td}>{slot.timeSlot}</td>
                      <td style={styles.td}>{new Date(slot.date).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        {slot.meetingLink ? (
                          <a href={slot.meetingLink} target="_blank" rel="noopener noreferrer">
                            Join Meeting
                          </a>
                        ) : (
                          'No Meeting Link Available'
                        )}
                      </td>
                      <td style={styles.td}>
                        {slot.confirmationStatus === 'confirmed' ? 'Confirmed' 
                          : slot.confirmationStatus === 'notConfirmed' ? 'Not Confirmed' 
                          : 'Pending'}
                      </td>
                      <td style={styles.td}>{slot.status}</td>
                      <td style={styles.td}>
                        <button 
                          style={styles.statusButton} 
                          onClick={() => updateStatus(slot.userId, slot._id, 'attended')}
                          disabled={slot.status === 'attended'}
                        >
                          Mark as Attended
                        </button>
                      </td>
                      <td style={styles.td}>
                        <button 
                          style={styles.notAttendedButton} 
                          onClick={() => updateStatus(slot.userId, slot._id, 'not attended')}
                          disabled={slot.status === 'not attended'}
                        >
                          Mark as Not Attended
                        </button>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.deleteButton}
                          onClick={() => deleteSlot(slot.userId, slot._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No time slots available for this month.</p>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default BtechMonthPage;
